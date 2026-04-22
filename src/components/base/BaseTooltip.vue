<template>
  <span v-if="as === 'span'" v-tooltip="tooltipOptions" :class="class">
    <slot />
  </span>
  <div v-else v-tooltip="tooltipOptions" :class="class">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  value?: string;
  showDelay?: number;
  hideDelay?: number;
  disabled?: boolean;
  as?: "span" | "div";
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: "",
  showDelay: 0,
  hideDelay: 0,
  disabled: false,
  as: "span",
  class: "",
});

const tooltipOptions = computed(() => {
  if (props.disabled || !props.value) {
    return null;
  }

  // PrimeVue tooltip directive accepts an object with these properties
  return {
    value: props.value,
    showDelay: props.showDelay,
    hideDelay: props.hideDelay,
    pt: {
      root: {
        class: ` ${props.class}`.trim(),
      },
      text: {
        class: "!py-1 !px-2 !text-sm !bg-primary !text-white",
      },
    },
  };
});
</script>

<style scoped></style>
