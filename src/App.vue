<script setup lang="ts">
import { ref, watch } from "vue";
import { useAppColors } from "./store/appColors";
import { useTheme } from "vuetify";
import { useAudioSettings } from "@/store/audioSettings";
import { usePatchConsole } from "@/store/patchConsole";
import { useUserSettings } from "@/store/userSettings";
import { init } from "@/toneInit";

const theme = useTheme();
const appColors = useAppColors();
const userSettings = useUserSettings();

const updateAppColors = () => {
  appColors.setSignalColor(theme.current.value.colors["secondary"] ?? "#fff");
  appColors.setMessageBusColor(
    theme.current.value.colors["on-surface"] ?? "#fff",
  );
  appColors.setTextColor(theme.current.value.colors["on-surface"] ?? "#fff");
  appColors.setBackgroundColor(
    theme.current.value.colors["background"] ?? "#fff",
  );
};

updateAppColors();

const isDarkMode = ref(theme.global.name.value === "dark");
const settingsDialog = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref<string>("primary");
const snackbarTitle = ref("");
const patchConsole = usePatchConsole();

watch(isDarkMode, (newValue) => {
  theme.change(newValue ? "dark" : "light");
  updateAppColors();
  userSettings.isDarkMode = newValue;
});

watch(
  () => patchConsole.latestMessage,
  (msg) => {
    if (!msg) return;
    snackbarMessage.value = msg.content;
    snackbarTitle.value =
      msg.type === "error" ? "Error" : msg.type === "warn" ? "Warning" : "Info";
    snackbarColor.value =
      msg.type === "error"
        ? "error"
        : msg.type === "warn"
          ? "warning"
          : "primary";
    snackbar.value = true;
  },
  { deep: true },
);

init(() => {
  const audioSettings = useAudioSettings();
  audioSettings.setInitialized(true);
});
</script>

<template>
  <v-app>
    <v-app-bar density="comfortable" flat>
      <template v-slot:title>
        <router-link to="/" class="title-link">Web Audio Modular</router-link>
      </template>
      <v-spacer></v-spacer>
      <v-btn variant="text" to="/">Patcher</v-btn>
      <v-menu open-on-hover>
        <template #activator="{ props }">
          <v-btn variant="text" v-bind="props">Documentation</v-btn>
        </template>
        <v-list density="compact">
          <v-list-item to="/overview" title="Overview" />
          <v-list-item to="/modules" title="Modules" />
        </v-list>
      </v-menu>
      <v-btn
        icon="mdi-cog"
        aria-label="Settings"
        @click="settingsDialog = true"
      ></v-btn>
    </v-app-bar>

    <v-dialog v-model="settingsDialog" max-width="400">
      <v-card title="Settings">
        <v-card-text>
          <div class="d-flex align-center justify-space-between">
            <span>Dark Mode</span>
            <v-switch v-model="isDarkMode" hide-details></v-switch>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="settingsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-main>
      <v-container class="d-flex align-center justify-center">
        <RouterView />
      </v-container>
    </v-main>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="5000"
      location="bottom start"
      class="snackbar-offset"
    >
      <div class="text-subtitle-2 font-weight-medium mb-1">
        {{ snackbarTitle }}
      </div>
      {{ snackbarMessage }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style scoped>
.title-link {
  color: inherit;
  text-decoration: none;
  font-size: inherit;
  font-weight: inherit;
}

.snackbar-offset {
  margin: 1.5em;
}
</style>
