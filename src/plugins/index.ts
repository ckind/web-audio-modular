/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import { createPinia } from "pinia";
import { useUserSettings } from "@/store/userSettings";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import router from "@/router";

import type { App } from "vue";

export function registerPlugins(app: App) {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);

  const userSettings = useUserSettings(pinia);

  let defaultTheme = "system";

  if (userSettings?.isDarkMode !== undefined) {
    defaultTheme = userSettings.isDarkMode ? "dark" : "light";

    console.log("User preference for dark mode:", userSettings.isDarkMode);
  }

  const vuetify = createVuetify({
    theme: {
      defaultTheme: defaultTheme,
    },
  });

  app.use(vuetify);
  app.use(router);
}
