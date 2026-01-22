<script setup lang="ts">
import { type PropType, ref } from "vue";
import type { PlayerModuleOptions } from "@/classes/audio-modules/PlayerModule";
import WaveformDisplay from "../WaveformDisplay.vue";

const props = defineProps({
  options: {
    type: Object as PropType<PlayerModuleOptions>,
    required: true,
  },
});

const amplitudeData = ref<Float32Array<ArrayBuffer>>(new Float32Array());

const toggleReverse = () => {
  props.options.reverse = !props.options.reverse;
}

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
      <v-btn
        :variant="props.options.reverse ? 'tonal' : 'text'"
        class="text-lowercase elevation-0"
        @click="toggleReverse"
        >reverse</v-btn
      >
    </div>
  </div>
</template>
