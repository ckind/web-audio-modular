<script setup lang="ts">
import { ref, watch } from "vue";
import { useAppColors } from "./store/appColors";
import { useTheme } from "vuetify";
import { useAudioSettings } from "@/store/audioSettings";
import { init } from "@/toneInit";

const theme = useTheme();
const appColors = useAppColors();
const updateAppColors = () => {
  appColors.setSignalColor(
    theme.current.value.colors["secondary"] ?? "#fff",
  );
  appColors.setMessageBusColor(theme.current.value.colors["on-surface"] ?? "#fff");
  appColors.setTextColor(theme.current.value.colors["on-surface"] ?? "#fff");
  appColors.setBackgroundColor(
    theme.current.value.colors["background"] ?? "#fff",
  );
};

updateAppColors();

const isDarkMode = ref(theme.global.name.value === "dark");
const settingsDialog = ref(false);
watch(isDarkMode, (newValue) => {
  theme.change(newValue ? "dark" : "light");
  updateAppColors();
});

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
      <v-btn variant="text" to="/overview">Overview</v-btn>
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
  </v-app>
</template>

<style scoped>
.title-link {
  color: inherit;
  text-decoration: none;
  font-size: inherit;
  font-weight: inherit;
}
</style>
