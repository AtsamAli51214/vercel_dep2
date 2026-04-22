<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import ClubContactForm from "@/components/ClubContactForm.vue";
import type { ClubContactApiFormat } from "@/types/common";
import { clubService } from "@/services";
import { useAppLoader } from "@/composables";
import { showError, showSuccess } from "@/utils/toast";

interface DashboardContact {
  id?: number;
  name: string;
  role?: string;
  roleId?: number;
  phone?: string;
  email: string;
  isPrimary?: boolean;
  hasAdminAccess?: boolean;
}

interface Props {
  club?: { id: number };
  contact?: DashboardContact | null;
}

const props = defineProps<Props>();

const model = defineModel<boolean>();
const emit = defineEmits<{
  (e: "refresh"): void;
}>();

const { t } = useI18n();
const loader = useAppLoader();

const clubContactFormRef = ref<InstanceType<typeof ClubContactForm> | null>(
  null,
);

const isEdit = computed(() => !!props.contact?.id);

const defaultContact: ClubContactApiFormat = {
  name: "",
  roleTypeId: 0,
  email: "",
  phone: "",
  hasAdminAccess: false,
  isPrimary: false,
};

const contactData = ref<ClubContactApiFormat>({ ...defaultContact });

const convertToClubContact = (
  contact: DashboardContact,
): ClubContactApiFormat => {
  return {
    ...(contact.id && { id: contact.id }),
    name: contact.name,
    roleTypeId: contact.roleId || 0,
    email: contact.email,
    phone: contact.phone || "",
    isPrimary: contact.isPrimary || false,
    hasAdminAccess: contact.hasAdminAccess || false,
  };
};

watch(
  () => props.contact,
  (newContact) => {
    if (newContact) {
      contactData.value = convertToClubContact(newContact);
    } else {
      contactData.value = { ...defaultContact };
    }
  },
  { immediate: true },
);

const updateContact = (contact: ClubContactApiFormat) => {
  contactData.value = contact;
};

const handleSave = async () => {
  loader.setLoading(true);
  const result = await clubContactFormRef.value?.validate();
  if (!result?.valid) {
    showError(t("validation.pleaseFillAllRequiredFields"), t);
    loader.setLoading(false);
    return;
  }

  if (!props.club?.id) {
    showError(t("Clubs.noClubSelected"), t);
    loader.setLoading(false);
    return;
  }

  try {
    const apiContact = {
      ...(contactData.value.id !== undefined && { Id: contactData.value.id }),
      Name: contactData.value.name,
      RoleTypeId: contactData.value.roleTypeId,
      Email: contactData.value.email,
      Phone: contactData.value.phone || "",
      IsPrimary: contactData.value.isPrimary,
      HasAdminAccess: contactData.value.hasAdminAccess,
    };

    let response;
    if (isEdit.value && contactData.value.id) {
      response = await clubService.updateContact(
        props.club.id,
        contactData.value.id,
        apiContact,
      );
    } else {
      response = await clubService.addContact(props.club.id, apiContact);
    }

    if (response.success) {
      showSuccess(
        isEdit.value
          ? t("Clubs.contactUpdatedSuccessfully")
          : t("Clubs.contactAddedSuccessfully"),
        t,
      );
      model.value = false;
      emit("refresh");
    } else {
      showError(
        response.error ||
          (isEdit.value
            ? t("Clubs.errorUpdatingContact")
            : t("Clubs.errorAddingContact")),
        t,
      );
    }
  } catch (error) {
    console.error("Error saving contact:", error);
    showError(
      isEdit.value
        ? t("Clubs.errorUpdatingContact")
        : t("Clubs.errorAddingContact"),
      t,
    );
  } finally {
    loader.setLoading(false);
  }
};
</script>

<template>
  <Dialog
    v-model:visible="model"
    :style="{ width: '650px' }"
    :header="
      isEdit
        ? t('Clubs.contactInfo.editContact')
        : t('Clubs.contactInfo.addContact')
    "
    :closable="false"
    modal
    class="p-fluid"
  >
    <ClubContactForm
      ref="clubContactFormRef"
      :initial-contact="contactData"
      :show-delete="false"
      @save="updateContact"
    />

    <template #footer>
      <Button
        :label="t('app.cancel')"
        severity="secondary"
        @click="model = false"
      />
      <Button :label="t('app.save')" @click="handleSave" />
    </template>
  </Dialog>
</template>

<style scoped></style>
