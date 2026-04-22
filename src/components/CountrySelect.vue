<template>
  <Select
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :options="countryOptions"
    optionLabel="name"
    optionValue="value"
    fluid
    :placeholder="placeholder"
    :invalid="!!invalid"
    :disabled="disabled"
  >
    <template #option="{ option }">
      <div class="flex items-center gap-2">
        <img :src="getCountryFlag(option.value)" :alt="option.name" />
        <span>{{ option.name }}</span>
      </div>
    </template>
    <template #value="{ value }">
      <div v-if="value" class="flex items-center gap-2">
        <img :src="getCountryFlag(value)" :alt="value" />
        <span>{{ getCountryName(value) }}</span>
      </div>
      <span v-else class="text-secondary-color">{{ placeholder }}</span>
    </template>
  </Select>
</template>

<script setup lang="ts">
import { BEIcon, NlIcon } from "@/assets/images";
import type { Option } from "@/types";

interface Props {
  modelValue?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "",
  invalid: false,
  disabled: false,
});

defineEmits<{
  "update:modelValue": [value: string];
}>();

const countryOptions: Option[] = [
  {
    name: "Netherlands",
    value: "NL",
  },
  {
    name: "Belgium",
    value: "BE",
  },
];

const getCountryFlag = (code: string): string => {
  const flags: Record<string, string> = {
    NL: NlIcon,
    BE: BEIcon,
  };
  return flags[code] || "";
};

const getCountryName = (code: string): string => {
  const country = countryOptions.find((c) => c.value === code);
  return country?.name || "";
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
