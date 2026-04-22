<template>
  <div>
    <div class="font-medium mb-2.5" v-if="label">{{ label }}</div>
    <slot name="beforeInput" />
    <MultiSelect
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="options"
      :optionLabel="optionLabel"
      :optionValue="optionValue"
      display="chip"
      chipIcon="pi pi-times"
      fluid
      :placeholder="placeholder"
      :invalid="invalid"
      :disabled="disabled"
      :loading="loading"
      :pt="{
        chipItem: {
          class: 'text-primary! rounded-2xl',
        },
      }"
    >
      <template #header v-if="showSelectAll">
        <div class="absolute left-11 top-2">
          {{ selectAllLabel || t("Users.selectAll") }}
        </div>
      </template>
      <template #option="{ option }">
        <div class="flex items-center gap-2">
          <img
            v-if="optionImage"
            :alt="option[optionLabel]"
            :src="getOptionImage(option)"
          />
          <div>{{ option[optionLabel] }}</div>
        </div>
      </template>
    </MultiSelect>
    <small class="p-invalid" v-if="error">
      {{ error }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

interface Props {
  modelValue: any[];
  options: any[];
  optionLabel?: string;
  optionValue?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  invalid?: boolean;
  disabled?: boolean;
  loading?: boolean;
  showSelectAll?: boolean;
  selectAllLabel?: string;
  chipImage?: boolean;
  optionImage?: boolean;
  getChipImageFn?: (value: any) => string;
  getOptionImageFn?: (option: any) => string;
}

const props = withDefaults(defineProps<Props>(), {
  optionLabel: "name",
  optionValue: "value",
  showSelectAll: true,
  chipImage: false,
  optionImage: false,
});

defineEmits<{
  "update:modelValue": [value: any[]];
}>();

const { t } = useI18n();

const getOptionImage = (option: any): string | undefined => {
  if (props.getOptionImageFn) {
    return props.getOptionImageFn(option);
  }
  return undefined;
};
</script>

<style>
@import "@/assets/styles/components/base-multiselect.css";
</style>
