<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);
const localNotes = ref(props.options.notes ?? "");

watch(
  () => props.options.notes,
  (newValue) => {
    if (localNotes.value === newValue) return;
    localNotes.value = newValue ?? "";
  },
  { immediate: true },
);

watch(localNotes, (newValue) => {
  if (newValue === props.options.notes) return;
  emit("options-updated", { notes: newValue });
});
</script>

<template>
  <v-textarea
    label="notes"
    v-model="localNotes"
    @mousedown.stop
    @touchstart.stop
    hide-details
    variant="solo"
    resize="both"
    auto-grow
  ></v-textarea>
</template>

<style scoped></style>
