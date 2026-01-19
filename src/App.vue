<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import useResizeObserver from "@/composables/useResizeObserver";
import { useAppColors } from "./store/appColors";
import { useTheme } from "vuetify";
import { useAudioSettings } from "@/store/audioSettings";
import { init } from "@/toneInit";
import ScaleWorkletNode from "./classes/audio-nodes/ScaleWorkletNode";
import * as Tone from "tone";

const theme = useTheme();
const appColors = useAppColors();
const updateAppColors = () => {
  appColors.setMessageBusColor(
    theme.current.value.colors["secondary"] ?? "#fff",
  );
  appColors.setSignalColor(theme.current.value.colors["on-surface"] ?? "#fff");
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

const onContainerResize = (entries: ResizeObserverEntry[]): void => {
  patchWindowWidth.value = entries[0]!.contentRect.width;
  patchWindowHeight.value = entries[0]!.contentRect.height;
};

useResizeObserver("patchWindowContainer", onContainerResize);

const patchWindowWidth = ref(0);
const patchWindowHeight = ref(0);

init(() => {
  const audioSettings = useAudioSettings();
  audioSettings.setInitialized(true);
});
</script>

<template>
  <v-app>
    <v-app-bar density="comfortable" flat title="Web Audio Modular">
      <v-spacer></v-spacer>
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
        <div ref="patchWindowContainer" class="patch-window-container">
          <PatchWindow :height="patchWindowHeight" :width="patchWindowWidth" />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.patch-window-container {
  height: 80vh;
  width: 90vw;
}
</style>
