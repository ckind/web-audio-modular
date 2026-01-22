<script setup lang="ts">
import { type PropType, ref, watch } from "vue";
import * as Tone from "tone";

const emit = defineEmits(["file-updated", "buffer-data-updated"]);

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
    emit("file-updated", file);
  }
});
</script>

<template>
  <v-file-input
    class="mb-2"
    prepend-icon="mdi-file-music-outline"
    label="load sample..."
    v-model="selectedFile"
    :rules="fileValidationRules"
    hide-details
    density="compact"
    accept="audio/*"
  ></v-file-input>
</template>
