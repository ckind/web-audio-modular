<script setup lang="ts">
import { type PropType, ref, watch } from "vue";
import type { PlayerModuleOptions } from "@/classes/audio-modules/PlayerModule";
import WaveformDisplay from "../WaveformDisplay.vue";
import * as Tone from "tone";

const props = defineProps({
  options: {
    type: Object as PropType<PlayerModuleOptions>,
    required: true,
  },
});

const amplitudeData = ref<Float32Array<ArrayBuffer>>(new Float32Array());
const selectedFile = ref<File | null>(null);
const fileValidationRules = ref([
  (v: any) =>
    !v ||
    (v instanceof File && v.type.startsWith("audio/")) ||
    "Must be an audio file",
]);

watch(selectedFile, async (file: File | null) => {
  if (file && !file.type.startsWith("audio/")) {
    console.warn("Selected file is not an audio file.");
  } else {
    const fileURL = URL.createObjectURL(file!);
    const response = await fetch(fileURL);
    const arrayBuffer = await response.arrayBuffer();
    const buffer =
      await Tone.getContext().rawContext.decodeAudioData(arrayBuffer);

    props.options.audioUrl = fileURL;

    // just get first channel for now - could sum for stereo signals
    amplitudeData.value = buffer.getChannelData(0);
  }
});
</script>

<template>
  <div>
    <v-file-input
      class="mb-2"
      prepend-icon="mdi-file-music-outline"
      label="load sample..."
      v-model="selectedFile"
      :rules="fileValidationRules"
      hide-details
      density="compact"
    ></v-file-input>
    <v-divider class="my-2" />
    <WaveformDisplay :amplitudeData="amplitudeData" :width="300" :height="60" />
    <v-divider class="my-2" />
    <div class="ma-2">
      <number-input
        v-model="props.options.fadeInTime"
        :min="0"
        :max="2"
        :step="0.01"
        :inputWidth="40"
        label="fade-in"
        class="mr-1"
      />
      <number-input
        v-model="props.options.fadeOutTime"
        :min="0"
        :max="2"
        :step="0.01"
        :inputWidth="40"
        label="fade-out"
        class="mr-1"
      />
    </div>
  </div>
</template>
