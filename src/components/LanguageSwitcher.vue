<template>
  <div class="language-switcher" :class="{ 'auth-mode': authMode }">
    <span
      class="text-sm font-medium cursor-pointer"
      :class="languageModel === 'en' ? 'text-primary' : 'text-secondary-text'"
      @click="languageModel = 'en'"
      >ENG</span
    >
    <ToggleSwitch
      v-model="languageModel"
      trueValue="nl"
      falseValue="en"
      :pt="{
        slider: {
          class: '!bg-transparent !bg-center !bg-no-repeat !p-0 ',
          style: `background-image: url(${languageModel === 'nl' ? NlFlagImage : UKFlagImage}); background-size: 40px;`,
        },
        handle: {
          class: ' !shadow-primary',
          style: 'box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);',
        },
      }"
    />
    <span
      class="text-sm font-medium cursor-pointer"
      :class="languageModel === 'nl' ? 'text-primary' : 'text-secondary-text'"
      @click="languageModel = 'nl'"
      >NL</span
    >
  </div>
</template>

<script setup lang="ts">
import { NlFlagImage, UKFlagImage } from "@/assets/images";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
  authMode?: boolean;
}

withDefaults(defineProps<Props>(), {
  authMode: false,
});

const { locale } = useI18n();

const languageModel = ref(localStorage.getItem("locale") || locale);

watch(languageModel, (newValue) => {
  localStorage.setItem("locale", newValue);
  window.location.reload();
});
</script>

<style scoped>
@reference "@/assets/tailwind.css";

.language-switcher {
  @apply flex items-center justify-center gap-2;
}

.language-switcher.auth-mode {
  @apply absolute top-4 right-4 z-10;
}
</style>
