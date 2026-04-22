<template>
  <div class="">
    <div v-if="label" class="font-medium mb-2.5">
      {{ label }}
      <span v-if="required" class="ml-1 text-red-500">*</span>
      <small v-else-if="showOptional"> ({{ t("app.optional") }}) </small>
    </div>

    <InputGroup
      :pt="{
        root: {
          class: inputGroupFocusClass,
        },
      }"
    >
      <InputGroupAddon
        :pt="{
          root: {
            class: '!p-0 !border-r-0',
          },
        }"
      >
        <Select
          v-model="selectedCountry"
          :options="countries"
          optionLabel="name"
          optionValue="code"
          @update:modelValue="handleCountryChange"
          :pt="{
            label: {
              class: '!px-2',
            },
            dropdown: {
              class: '!w-4 pr-1',
            },
          }"
        >
          <template #value="{ value }">
            <div v-if="value" class="flex items-center gap-1">
              <img :src="getCountryFlag(value)" :alt="value" />
              <span class="text-sm font-medium text-gray-500">
                {{ getCountryCode(value) }}
              </span>
            </div>
          </template>
          <template #option="{ option }">
            <div class="flex items-center gap-2 py-1">
              <img :src="option.flag" :alt="option.name" />
              <span class="text-sm font-medium text-gray-500">{{
                option.dialCode
              }}</span>
              <span class="text-gray-700">{{ option.name }}</span>
            </div>
          </template>
        </Select>
      </InputGroupAddon>

      <InputMask
        :id="inputId"
        v-model="internalPhoneNumber"
        :mask="mask"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClass"
        @focus="isFocused = true"
        @blur="isFocused = false"
        :pt="{
          root: {
            class:
              '!border-l-0 focus:!ring-0 focus:!outline-none focus:!border-l-0 focus:!border-stroke',
          },
        }"
        fluid
      />
    </InputGroup>

    <small v-if="error" class="p-invalid">
      {{ error }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Country } from "@/types/common";
import { useI18n } from "vue-i18n";
import { BEIcon, NlIcon } from "@/assets/images";

const { t } = useI18n();

const countries: Country[] = [
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: NlIcon },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: BEIcon },
];

interface Props {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  showOptional?: boolean;
  mask?: string;
  defaultCountry?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  label: "",
  placeholder: "976 12345678",
  error: "",
  disabled: false,
  readonly: false,
  required: false,
  showOptional: false,
  mask: "999999999",
  defaultCountry: "BE",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const selectedCountry = ref<string>(props.defaultCountry);
const phoneNumber = ref<string>("");
const isFocused = ref<boolean>(false);

const inputId = computed(
  () => `phone-input-${Math.random().toString(36).slice(2, 11)}`,
);

const internalPhoneNumber = computed({
  get: () => phoneNumber.value,
  set: (value: string) => {
    phoneNumber.value = value;
    updateModelValue();
  },
});

const getCountryFlag = (code: string): string =>
  countries.find((c) => c.code === code)?.flag || NlIcon;

const getCountryCode = (code: string): string =>
  countries.find((c) => c.code === code)?.dialCode || "+32";

const updateModelValue = (): void => {
  const dialCode = getCountryCode(selectedCountry.value);
  const fullPhone = phoneNumber.value ? `${dialCode} ${phoneNumber.value}` : "";
  emit("update:modelValue", fullPhone);
};

const handleCountryChange = (): void => {
  updateModelValue();
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      phoneNumber.value = "";
      return;
    }

    const country = countries.find((c) => newValue.startsWith(c.dialCode));
    if (country) {
      selectedCountry.value = country.code;
      phoneNumber.value = newValue.replace(country.dialCode, "").trim();
    } else {
      phoneNumber.value = newValue;
    }
  },
  { immediate: true },
);

watch(
  () => props.defaultCountry,
  (newCountry) => {
    if (newCountry && !phoneNumber.value) {
      selectedCountry.value = newCountry;
    }
  },
);

const inputClass = computed(() => ({
  "p-invalid": props.error,
}));

const inputGroupFocusClass = computed(() => {
  if (props.error) {
    return "!ring-1 !ring-red-200 !border-error";
  }
  if (isFocused.value) {
    return "!ring-1 !ring-primary-200 !border-primary rounded-lg";
  }
  return "";
});
</script>

<style scoped></style>
