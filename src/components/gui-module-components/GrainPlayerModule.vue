<script setup lang="ts">
import { type PropType, ref } from "vue";
import type { GrainPlayerModuleOptions } from "@/classes/audio-modules/GrainPlayerModule";
import WaveformDisplay from "../WaveformDisplay.vue";

const props = defineProps({
  options: {
    type: Object as PropType<GrainPlayerModuleOptions>,
    required: true,
  },
});

const amplitudeData = ref<Float32Array<ArrayBuffer>>(new Float32Array());

const onFileUrlUpdated = (fileUrl: string) => {
  props.options.audioUrl = fileUrl;
};

const onBufferDataUpdated = (buffer: Float32Array<ArrayBuffer>) => {
  amplitudeData.value = buffer;
};
</script>

<template>
  <div>
    <audio-file-picker
      @file-url-updated="onFileUrlUpdated"
      @buffer-data-updated="onBufferDataUpdated"
    />
    <v-divider class="my-2" />
    <WaveformDisplay :amplitudeData="amplitudeData" :width="300" :height="60" />
    <v-divider class="my-2" />
    <div class="ma-2"></div>
  </div>
</template>
