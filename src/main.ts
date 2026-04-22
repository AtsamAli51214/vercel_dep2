import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import router from "@/router";
import en from "@/locale/en.json";
import nl from "@/locale/nl.json";
import { createI18n } from "vue-i18n";
import moment from "moment";
import "moment/dist/locale/nl";

import "@/assets/tailwind.css";
import "@/assets/styles.scss";

import GlobalComponents from "@/plugin/globalComponent";

const pinia = createPinia();

const messages = { en, nl };
const locale = localStorage.getItem("locale") || "nl";

const i18n = createI18n({
  globalInjection: true,
  legacy: false,
  locale,
  fallbackLocale: "nl",
  messages,
});

moment.locale(locale);

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(GlobalComponents);x

app.mount("#app");
