<script setup lang="ts">
import { ref, watch } from "vue";
import * as Tone from "tone";

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);

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
    console.log("Selected file:", file);

    const fileURL = URL.createObjectURL(file!);
    const response = await fetch(fileURL);
    const arrayBuffer = await response.arrayBuffer();
    const buffer =
      await Tone.getContext().rawContext.decodeAudioData(arrayBuffer);
    const sharedArrayBuffers = Array.from(
      { length: buffer.numberOfChannels },
      () => {
        return new SharedArrayBuffer(
          Float32Array.BYTES_PER_ELEMENT * buffer.length,
        );
      },
    );
    const sharedChannelData = sharedArrayBuffers.map((sab, c) => {
      const channelData = new Float32Array(sab);
      channelData.set(buffer.getChannelData(c));
      return channelData;
    });

    emit("options-updated", {
      sharedChannelData: sharedChannelData,
    });
  }
});
</script>

<template>
  <div class="sampler-plus-module">
    <v-file-input
      prepend-icon="mdi-file-music-outline"
      label="load sample..."
      v-model="selectedFile"
      :rules="fileValidationRules"
      hide-details
      density="compact"
    ></v-file-input>
  </div>
</template>

<style scoped>
.sampler-plus-module {
  min-width: 12em;
}
</style>
