<script setup>
import { ref } from "vue";

const op = ref();

const toggle = (event) => {
  op.value.toggle(event);
};

defineExpose({ toggle });
</script>
<template>
  <Popover ref="op">
    <template #container="{ closeCallback }">
      <div class="p-4 w-25rem">
        <slot></slot>
        <div class="flex align-items-center gap-2 justify-content-end">
          <Button
            label="Close"
            icon="fas fa-times"
            size="small"
            @click="closeCallback"
          />
        </div>
      </div>
    </template>
  </Popover>
</template>
