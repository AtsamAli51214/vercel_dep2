<template>
  <div class="">
    <QuillEditor
      theme="snow"
      :toolbar="toolbarOptions"
      v-model:content="modelValue"
      contentType="html"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

const modelValue = defineModel<string>();

const props = defineProps<{
  placeholder?: string;
  showImage?: boolean;
}>();

const toolbarOptions = ref([
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline"],
  ["link", props.showImage ? "image" : undefined],
  [{ list: "ordered" }, { list: "bullet" }],
]);
</script>

<style lang="scss" src="@/assets/styles/components/base-editor.css" />
