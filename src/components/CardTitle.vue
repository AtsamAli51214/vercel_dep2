<template>
  <div class="card-title">
    {{ props.title }}
    <small v-if="subtitle">({{ subtitle }})</small>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
}

const props = defineProps<Props>();
</script>

<style scoped></style>
