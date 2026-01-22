<script setup lang="ts">
import { type PropType, ref } from "vue";
import type { GrainPlayerModuleOptions } from "@/classes/audio-modules/GrainPlayerModule";
import WaveformDisplay from "../WaveformDisplay.vue";
import * as Tone from "tone";

const props = defineProps({
  options: {
    type: Object as PropType<GrainPlayerModuleOptions>,
    required: true,
  },
});

const amplitudeData = ref<Float32Array<ArrayBuffer>>(new Float32Array());

const onFileUpdated = async (file: File) => {
  const fileURL = URL.createObjectURL(file!);
  props.options.audioUrl = fileURL;

  const response = await fetch(fileURL);
  const arrayBuffer = await response.arrayBuffer();
  const buffer =
    await Tone.getContext().rawContext.decodeAudioData(arrayBuffer);

  amplitudeData.value = buffer.getChannelData(0);
};
</script>

<template>
  <div>
    <audio-file-picker @file-updated="onFileUpdated" />
    <v-divider class="my-2" />
    <WaveformDisplay :amplitudeData="amplitudeData" :width="300" :height="60" />
    <v-divider class="my-2" />
    <div class="ma-2"></div>
  </div>
</template>
