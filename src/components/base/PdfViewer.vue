<template>
  <iframe
    :src="pdfUrl"
    class="w-full rounded-xl hf-pdfs h-[70vh]"
    style="height: 800px"
    title="PDF Viewer"
  />
  <!-- <div class="h-[70vh] min-h-[600px]">
    <VuePDFjs :source="pdfUrl" :options="options" class="rounded-xl" />
  </div> -->
</template>

<script setup lang="ts">
// import { reactive, computed } from "vue";
// import { VuePDFjs } from "@tuttarealstep/vue-pdf.js";
// import "@tuttarealstep/vue-pdf.js/dist/style.css";
// import { useI18n } from "vue-i18n";
// import enUS_FTL from "@tuttarealstep/vue-pdf.js/l10n/en-US/viewer.ftl?raw";
// import nl_FTL from "@tuttarealstep/vue-pdf.js/l10n/nl/viewer.ftl?raw";

defineProps<{
  pdfUrl: string;
}>();

// const { locale } = useI18n();

// const options = reactive({
//   locale: computed(() => ({
//     code: locale.value === "nl" ? "nl" : "en-US",
//     ftl: locale.value === "nl" ? nl_FTL : enUS_FTL,
//   })),
//   toolbar: {
//     options: {
//       pageNumber: true,
//       numPages: true,
//       scaleSelect: true,
//       zoomInButton: true,
//       zoomOutButton: true,
//       previous: true,
//       next: true,
//       printButton: true,
//       downloadButton: true,

//       editorFreeTextButton: false,
//       editorHighlightButton: false,
//       editorInkButton: false,
//       editorStampButton: false,

//       secondaryToolbarToggleButton: true,

//       viewFindButton: true,
//     },
//   },
// });
</script>

<style lang="scss" src="@/assets/styles/components/pdf-js.css" />
