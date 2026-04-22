<template>
  <div
    v-if="showDelete"
    class="absolute top-0 right-0 cursor-pointer"
    @click="$emit('remove')"
  >
    <img :src="MinusIcon" alt="Remove contact" />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <div class="font-medium mb-2.5">
        {{ t("Clubs.contactInfo.formName") }}
      </div>
      <InputText
        v-model="name"
        fluid
        :placeholder="t('Clubs.contactInfo.formName')"
        :invalid="!!errors.name"
      />
      <small class="p-invalid" v-if="errors.name">
        {{ errors.name }}
      </small>
    </div>

    <div>
      <div class="font-medium mb-2.5">
        {{ t("Clubs.contactInfo.formRole") }}
      </div>
      <Select
        v-model="roleTypeId"
        :options="roleOptions"
        option-label="label"
        option-value="value"
        fluid
        :placeholder="t('Clubs.contactInfo.formRole')"
        :invalid="!!errors.roleTypeId"
      />
      <small class="p-invalid" v-if="errors.roleTypeId">
        {{ errors.roleTypeId }}
      </small>
    </div>

    <div>
      <div class="font-medium mb-2.5">
        {{ t("Clubs.contactInfo.formEmail") }}
      </div>
      <InputText
        v-model="email"
        type="email"
        fluid
        :placeholder="t('Clubs.contactInfo.formEmail')"
        :invalid="!!errors.email || !!externalEmailError"
      />
      <small class="p-invalid" v-if="errors.email || externalEmailError">
        {{ errors.email || externalEmailError }}
      </small>
    </div>

    <div>
      <BasePhoneInput
        v-model="phone"
        showOptional
        :label="t('Users.phoneNumber')"
        :error="errors.phone"
        :default-country="defaultCountry"
      />
    </div>

    <div class="flex items-center gap-2">
      <Checkbox v-model="hasAdminAccess" :binary="true" size="small" />
      <span class="text-sm">
        {{ t("Clubs.contactInfo.formAdminAccess") }}
      </span>
    </div>

    <div class="flex items-center gap-2">
      <Checkbox v-model="isPrimary" :binary="true" size="small" />
      <span class="text-sm">
        {{ t("Clubs.contactInfo.formPrimaryContact") }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { MinusIcon } from "@/assets/images";
import { createClubContactSchema } from "@/utils/validation";
import type { ClubContactApiFormat } from "@/types/common";
import { getContactRoleOptions } from "@/constants/formOptions";

interface Props {
  initialContact?: ClubContactApiFormat;
  showDelete?: boolean;
  defaultCountry?: string;
  externalEmailError?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "save", contact: ClubContactApiFormat): void;
  (e: "remove"): void;
}>();

const { t } = useI18n();

const defaultContact: ClubContactApiFormat = {
  name: "",
  roleTypeId: 0,
  email: "",
  phone: "",
  hasAdminAccess: false,
  isPrimary: false,
};

const { defineField, errors, validate } = useForm({
  validationSchema: toTypedSchema(createClubContactSchema(t)),
  initialValues: props.initialContact || defaultContact,
  validateOnMount: false,
});

const [name] = defineField("name");
const [roleTypeId] = defineField("roleTypeId");
const [email] = defineField("email");
const [phone] = defineField("phone");
const [hasAdminAccess] = defineField("hasAdminAccess");
const [isPrimary] = defineField("isPrimary");

const contact = computed(
  (): ClubContactApiFormat => ({
    ...(props.initialContact?.id && { id: props.initialContact.id }),
    ...(props.initialContact?.uniqueId && {
      uniqueId: props.initialContact.uniqueId,
    }),
    name: name.value ?? "",
    roleTypeId: roleTypeId.value ?? 0,
    email: email.value ?? "",
    phone: phone.value ?? "",
    hasAdminAccess: hasAdminAccess.value ?? false,
    isPrimary: isPrimary.value ?? false,
  }),
);

watch([name, roleTypeId, email, phone, hasAdminAccess, isPrimary], () => {
  emit("save", contact.value);
});

defineExpose({
  validate,
});

const roleOptions = computed(() => getContactRoleOptions(t));
</script>
