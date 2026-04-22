<template>
  <form
    @submit.prevent="
      editingIndex !== null ? saveEditingContact() : handleNext()
    "
    class="flex flex-col gap-2"
  >
    <div
      class="flex items-center"
      :class="isEditMode ? 'justify-end' : 'justify-between'"
    >
      <span v-if="!isEditMode" class="font-semibold text-lg">{{
        !showPreview && editingIndex === null
          ? t("Clubs.contactInfo.formTitle")
          : editingIndex !== null
            ? t("Clubs.contactInfo.editContact")
            : t("Clubs.contactInfo.previewTitle")
      }}</span>

      <Button
        :label="t('Clubs.contactInfo.addContact')"
        icon="pi pi-plus-circle"
        severity="primary"
        rounded
        v-if="canAddMore"
        @click="addContact"
      />
    </div>

    <div v-if="!showPreview">
      <div v-if="editingContact" class="flex flex-col gap-6 mt-3">
        <div class="relative p-6 border rounded-3xl">
          <ClubContactForm
            :initial-contact="editingContact"
            :show-delete="false"
            :default-country="defaultCountry"
            :external-email-error="
              editingIndex !== null
                ? duplicateEmailErrors.get(editingIndex)
                : undefined
            "
            @save="updateEditingContact"
          />
        </div>
      </div>

      <div v-else-if="contacts.length > 0" class="flex flex-col gap-6 mt-3">
        <div
          v-for="(contact, index) in contacts"
          :key="contact.uniqueId || `contact-${index}`"
          class="flex flex-col gap-4"
        >
          <div v-if="contacts.length > 1" class="font-semibold text-stroke">
            {{ t("Clubs.contactInfo.contact") }} {{ index + 1 }}
          </div>
          <div class="relative p-6 border rounded-3xl">
            <ClubContactForm
              :ref="(el) => setContactFormRef(el, index)"
              :initial-contact="contact"
              :show-delete="contacts.length > 1"
              :default-country="defaultCountry"
              :external-email-error="duplicateEmailErrors.get(index)"
              @save="(updatedContact) => saveContact(index, updatedContact)"
              @remove="removeContact(index)"
            />
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl mt-3"
      >
        <i class="pi pi-users text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-500 mb-4">
          {{ t("Clubs.contactInfo.noContactsAdded") }}
        </p>
        <Button
          :label="t('Clubs.contactInfo.addContact')"
          icon="pi pi-plus-circle"
          severity="primary"
          @click="addContact"
        />
      </div>
    </div>

    <div v-else class="mt-3">
      <div
        v-if="contacts.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div
          v-for="(contact, index) in contacts"
          :key="contact.uniqueId || `contact-preview-${index}`"
          class="border rounded-2xl p-4"
        >
          <div class="flex flex-col gap-4">
            <div
              class="flex items-center"
              :class="contact.isPrimary ? 'justify-between' : 'justify-end'"
            >
              <img
                :src="StarIcon"
                alt="Primary contact"
                v-if="contact.isPrimary"
              />
              <div class="flex gap-1">
                <Button
                  icon="pi pi-trash"
                  severity="secondary"
                  size="small"
                  text
                  rounded
                  @click="removeContact(index)"
                />
                <Button
                  icon="pi pi-pencil"
                  severity="secondary"
                  size="small"
                  text
                  rounded
                  @click="editContact(index)"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="font-semibold text-primary font-inter">
                {{ contact.name }}
              </div>
              <div class="text-xs">
                <span>
                  {{ getRoleLabel(contact.roleTypeId) }}
                </span>
                <div class="text-secondary-color">{{ contact.phone }}</div>
                <div class="text-secondary-color">{{ contact.email }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="
        !isEditMode ||
        editingIndex !== null ||
        (!showPreview && contacts.length > 0)
      "
      class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
    >
      <div v-if="!isEditMode" class="flex justify-end gap-2">
        <Button
          :label="editingIndex !== null ? t('app.cancel') : t('app.skip')"
          fluid
          severity="secondary"
          @click="editingIndex !== null ? cancelEdit() : handleSkip()"
        />
        <Button
          :label="editingIndex !== null ? t('app.update') : t('app.next')"
          fluid
          type="submit"
        />
      </div>
      <div v-else class="flex justify-end gap-2">
        <Button
          v-if="editingIndex !== null"
          :label="t('app.cancel')"
          fluid
          severity="secondary"
          @click="cancelEdit()"
        />
        <Button
          :label="editingIndex !== null ? t('app.update') : t('app.save')"
          fluid
          variant="outlined"
          type="submit"
        />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { ClubContactApiFormat } from "@/types/common";
import ClubContactForm from "@/components/ClubContactForm.vue";
import { StarIcon } from "@/assets/images";
import { validateContactsDuplicateEmails } from "@/utils/validation";
import {
  getContactRoleOptions,
  getLabelByValue,
} from "@/constants/formOptions";
import { generateUniqueId } from "@/utils/helpers";

interface Props {
  contacts?: ClubContactApiFormat[];
  activateCallback?: (index: number) => void;
  isEditMode?: boolean;
  defaultCountry?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:contacts", contacts: ClubContactApiFormat[]): void;
  (e: "next"): void;
}>();

const { t } = useI18n();

const showPreview = ref(
  props.isEditMode && props.contacts && props.contacts.length > 0,
);
const editingIndex = ref<number | null>(null);
const editingContact = ref<ClubContactApiFormat | null>(null);

const contactFormRefs = ref<any[]>([]);

const setContactFormRef = (el: any, index: number) => {
  if (el) {
    contactFormRefs.value[index] = el;
  }
};

const defaultContact: ClubContactApiFormat = {
  uniqueId: generateUniqueId("contact"),
  name: "",
  roleTypeId: 0,
  email: "",
  phone: "",
  hasAdminAccess: false,
  isPrimary: false,
};

const getInitialContacts = (): ClubContactApiFormat[] => {
  if (props.contacts && props.contacts.length > 0) {
    return props.contacts.map((contact) => ({
      ...contact,
      uniqueId: contact.uniqueId || generateUniqueId("contact"),
    }));
  }
  return props.isEditMode
    ? []
    : [{ ...defaultContact, uniqueId: generateUniqueId("contact") }];
};

const contacts = ref<ClubContactApiFormat[]>(getInitialContacts());

watch(
  () => props.contacts,
  (newContacts) => {
    if (newContacts && newContacts.length > 0) {
      contacts.value = newContacts.map((contact) => ({
        ...contact,
        uniqueId: contact.uniqueId || generateUniqueId("contact"),
      }));
      showPreview.value = props.isEditMode && newContacts.length > 0;
    } else if (newContacts && newContacts.length === 0) {
      contacts.value = [];
      showPreview.value = false;
    }
  },
  { deep: true },
);

const canAddMore = computed(() => contacts.value.length < 5);

const addContact = () => {
  if (!canAddMore.value) return;

  showPreview.value = false;
  editingIndex.value = null;
  editingContact.value = null;
  contacts.value.push({
    ...defaultContact,
    uniqueId: generateUniqueId("contact"),
  });
};

const emitContactsUpdate = async () => {
  const isValid = await validateAllContacts();
  if (!isValid) return;

  if (duplicateEmailErrors.value.size > 0) return;

  if (props.isEditMode) {
    emit("update:contacts", contacts.value);
  }
};

const removeContact = (index: number) => {
  contacts.value.splice(index, 1);

  if (contacts.value.length === 0) showPreview.value = false;
  if (editingIndex.value === index) {
    editingContact.value = null;
    editingIndex.value = null;
  }

  emitContactsUpdate();
};

const saveContact = (index: number, updatedContact: ClubContactApiFormat) => {
  const oldEmail = contacts.value[index]?.email;
  if (oldEmail !== updatedContact.email) {
    duplicateEmailErrors.value.delete(index);
  }

  if (updatedContact.isPrimary) {
    ensureSinglePrimaryContact(index);
  }
  contacts.value[index] = { ...updatedContact };
};

const editContact = (index: number) => {
  showPreview.value = false;
  editingIndex.value = index;
  editingContact.value = { ...contacts.value[index] };
};

const updateEditingContact = (updatedContact: ClubContactApiFormat) => {
  if (editingIndex.value !== null) {
    const oldEmail = contacts.value[editingIndex.value]?.email;
    if (oldEmail !== updatedContact.email) {
      duplicateEmailErrors.value.delete(editingIndex.value);
    }
  }
  editingContact.value = updatedContact;
};

const ensureSinglePrimaryContact = (primaryIndex: number) => {
  contacts.value.forEach((c, i) => {
    if (i !== primaryIndex) c.isPrimary = false;
  });
};

const saveEditingContact = () => {
  if (!editingContact.value || editingIndex.value === null) return;

  if (editingContact.value.isPrimary) {
    ensureSinglePrimaryContact(editingIndex.value);
  }

  contacts.value[editingIndex.value] = { ...editingContact.value };
  editingContact.value = null;
  editingIndex.value = null;

  if (props.isEditMode) {
    showPreview.value = true;
    emitContactsUpdate();
  }
};

const cancelEdit = () => {
  editingContact.value = null;
  editingIndex.value = null;
  if (props.isEditMode) showPreview.value = true;
};

const roleOptions = computed(() => getContactRoleOptions(t));

const getRoleLabel = (roleId: number) =>
  getLabelByValue(roleOptions.value, roleId);

const handleSkip = () => {
  props.activateCallback?.(2);
  emit("next");
};

const duplicateEmailErrors = ref<Map<number, string>>(new Map());

const validateAllContacts = async () => {
  if (contacts.value.length === 0) return false;

  const results = await Promise.all(
    contactFormRefs.value
      .filter((ref) => ref?.validate)
      .map((ref) => ref.validate()),
  );

  const allValid = results.every((result) => result.valid);

  if (allValid) {
    duplicateEmailErrors.value = validateContactsDuplicateEmails(
      contacts.value,
      t,
    );
    if (duplicateEmailErrors.value.size > 0) {
      return false;
    }
  }

  return allValid;
};

const handleNext = async () => {
  if (!showPreview.value && contacts.value.length > 0) {
    const isValid = await validateAllContacts();
    if (!isValid) return;

    showPreview.value = true;
    emitContactsUpdate();
    return;
  }

  if (contacts.value.length > 0) {
    emit("update:contacts", contacts.value);
  }
  props.activateCallback?.(2);
  emit("next");
};
</script>
