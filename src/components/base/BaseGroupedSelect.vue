<template>
  <div class="grouped-select">
    <div
      v-for="group in groups"
      :key="group.id"
      class="group-row mb-3"
      :class="{ 'border-red-500': hasError(group.id) }"
    >
      <div class="font-medium mb-2 text-sm">
        {{ group.label }}
      </div>
      <SelectButton
        :model-value="internalValue?.[group.id]"
        :options="group.options"
        size="small"
        option-label="name"
        option-value="value"
        :allow-empty="true"
        @update:model-value="(value) => updateGroupValue(group.id, value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Group } from "@/types";

interface Props {
  modelValue?: Record<string, number | null | undefined> | number[];
  groups: Group[];
  invalid?: boolean;
  emitAsArray?: boolean;
}

interface Emits {
  (
    e: "update:modelValue",
    value: Record<string, number | null> | number[],
  ): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  invalid: false,
  emitAsArray: false,
});

const emit = defineEmits<Emits>();

const internalValue = computed<Record<string, number | null>>(() => {
  if (Array.isArray(props.modelValue)) {
    const record: Record<string, number | null> = {};
    const valueArray = props.modelValue as number[];

    props.groups.forEach((group) => {
      const matchingOption = group.options.find((opt) =>
        valueArray.includes(opt.value),
      );
      record[group.id] = matchingOption ? matchingOption.value : null;
    });
    return record;
  }
  return (props.modelValue as Record<string, number | null>) || {};
});

const updateGroupValue = (groupId: string, value: number | null) => {
  const newValue: Record<string, number | null> = { ...internalValue.value };
  newValue[groupId] = value;

  if (props.emitAsArray) {
    const arrayValue = Object.values(newValue).filter(
      (val) => val !== null && val !== undefined,
    ) as number[];
    emit("update:modelValue", arrayValue);
  } else {
    emit("update:modelValue", newValue);
  }
};

const hasError = (groupId: string): boolean => {
  return props.invalid && !internalValue.value?.[groupId];
};
</script>

<style scoped></style>
