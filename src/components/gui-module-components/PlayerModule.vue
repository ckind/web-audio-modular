<script setup lang="ts">
import { type PropType, ref, watch, computed } from "vue";
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

const emit = defineEmits(["options-updated"]);

const amplitudeData = ref<Float32Array<ArrayBuffer>>(new Float32Array());
const selectedFileRef = ref<File | File[] | null>(null);
const selectedFile = computed({
  get() {
    // use an empty file to display the name if we're loading
    // the resource file from module options
    if (selectedFileRef.value === null && props.options.resourceFile?.name) {
      return new File([], props.options.resourceFile.name);
    } else {
      return selectedFileRef.value;
    }
  },
  set(value) {
    selectedFile.value = value;
  },
});

const fadeInTime = computed({
  get() {
    return props.options.fadeInTime ?? 0;
  },
  set(value) {
    emit("options-updated", { fadeInTime: value });
  },
});

const fadeOutTime = computed({
  get() {
    return props.options.fadeOutTime ?? 0;
  },
  set(value) {
    emit("options-updated", { fadeOutTime: value });
  },
});

const toggleReverse = () => {
  emit("options-updated", { reverse: !props.options.reverse });
};

const loadAmplitudeData = async (blobUrl?: string) => {
  if (!blobUrl) {
    amplitudeData.value = new Float32Array();
    return;
  }
  const response = await fetch(blobUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer =
    await Tone.getContext().rawContext.decodeAudioData(arrayBuffer);

  amplitudeData.value = buffer.getChannelData(0);
};

watch(selectedFile, (file: File | File[] | null) => {
  if (file !== null && !Array.isArray(file)) {
    // register the uploaded file
    ResourceFileManager.registerResource(file.name, file);
    emit("options-updated", { resourceFile: new ResourceFile(file.name) });

    // finally release of registered file will be handled by the module instance
  }
});

watch(
  () => props.options.resourceFile,
  async (newResourceFile, oldResourceFile) => {
    if (oldResourceFile && newResourceFile !== oldResourceFile) {
      // release the previously registered resource
      ResourceFileManager.releaseResource(oldResourceFile.name);
    }

    if (newResourceFile?.name) {
      const url = ResourceFileManager.requestResource(newResourceFile.name);
      try {
        await loadAmplitudeData(url);
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
    <audio-file-picker v-model="selectedFile" />
    <v-divider class="my-2" />
    <WaveformDisplay :amplitudeData="amplitudeData" :width="300" :height="60" />
    <v-divider class="my-2" />
    <div class="ma-2">
      <number-input
        v-model="fadeInTime"
        :min="0"
        :max="2"
        :step="0.01"
        :inputWidth="40"
        label="fade-in"
        class="mr-1"
      />
      <number-input
        v-model="fadeOutTime"
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
