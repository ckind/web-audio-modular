<script setup lang="ts">
import { type PropType, ref, watch } from "vue";
import type { PlayerModuleOptions } from "@/classes/audio-modules/PlayerModule";
import WaveformDisplay from "../WaveformDisplay.vue";
import * as Tone from "tone";
import ResourceFile from "@/classes/ResourceFile";
import ResourceFileManager from "@/classes/ResourceFileManager";

const props = defineProps({
  options: {
    type: Object as PropType<PlayerModuleOptions>,
    required: true,
  },
});

const amplitudeData = ref<Float32Array<ArrayBuffer>>(new Float32Array());

const toggleReverse = () => {
  props.options.reverse = !props.options.reverse;
};

const onFileUpdated = async (file: File) => {
  // register the uploaded file
  ResourceFileManager.registerResource(file.name, file);
  props.options.resourceFile = new ResourceFile(file.name);
};

// todo: how update the file-picker to show new resourceFile name?
watch(
  () => props.options.resourceFile,
  async (newResourceFile, oldResourceFile) => {
    const nextName = newResourceFile?.name ?? null;
    const prevName = oldResourceFile?.name ?? null;

    if (prevName && prevName !== nextName) {
      // release the previously registered resource
      ResourceFileManager.releaseResource(prevName);
    }

    if (newResourceFile?.name) {
      const url = ResourceFileManager.requestResource(newResourceFile.name);
      if (!url) {
        amplitudeData.value = new Float32Array();
        return;
      }
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer =
          await Tone.getContext().rawContext.decodeAudioData(arrayBuffer);

        amplitudeData.value = buffer.getChannelData(0);
      } finally {
        ResourceFileManager.releaseResource(newResourceFile.name);
      }
    } else {
      amplitudeData.value = new Float32Array();
    }
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <audio-file-picker @file-updated="onFileUpdated" />
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
