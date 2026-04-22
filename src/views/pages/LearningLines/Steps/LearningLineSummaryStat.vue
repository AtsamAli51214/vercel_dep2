<template>
  <div class="flex flex-col gap-1 min-w-0 items-center">
    <span class="text-xs font-semibold text-secondary-color">{{ label }}</span>
    <div
      v-if="Array.isArray(value)"
      class="flex flex-wrap items-center justify-center gap-2"
    >
      <BaseExtras :items="value" :visible-count="3" item-key="value">
        <template #item="{ item }">
          <Tag
            :value="item"
            severity="secondary"
            rounded
            :pt="{
              label: { class: 'text-xs font-medium' },
              root: { class: 'border' },
            }"
          />
        </template>
      </BaseExtras>
    </div>
    <span
      v-else
      :class="[
        'text-lg font-semibold',
        multiline ? 'whitespace-pre-wrap wrap-break-word' : 'truncate',
      ]"
      >{{ value }}</span
    >
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number | string[];
  multiline?: boolean;
}>();
</script>
