import { fileURLToPath, URL } from "node:url";

import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    noDiscovery: true,
    include: [
      "quill",
      "quill-delta",
      "vuedraggable",
      "apexcharts",
      "vue3-apexcharts",
    ],
  },
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      vuedraggable: "vuedraggable/src/vuedraggable",
    },
  },
  build: {
    commonjsOptions: {
      include: [/quill/, /vuedraggable/, /node_modules/],
      transformMixedEsModules: true,
    },
    // rollupOptions: {
    //   output: {
    //     manualChunks(id) {
    //       if (id.includes("quill")) {
    //         return "quill-vendor";
    //       }
    //       if (id.includes("vuedraggable")) {
    //         return "vuedraggable";
    //       }
    //     },
    //   },
    // },
  },
});
