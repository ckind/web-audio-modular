<script setup lang="ts">
import { ref } from "vue";

const selectedFile = defineModel<File | File[] | null>();
const fileValidationRules = ref([
  (v: any) =>
    !v ||
    (v instanceof File && v.type.startsWith("audio/")) ||
    "Must be an audio file",
]);
</script>

<template>
  <v-file-input
    class="mb-2"
    prepend-icon="mdi-file-music-outline"
    label="load sample..."
    hide-details
    density="compact"
    accept="audio/*"
    v-model="selectedFile"
    :rules="fileValidationRules"
  ></v-file-input>
</template>
