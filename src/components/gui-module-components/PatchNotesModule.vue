<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);

const updateNotes = () => {
  emit("options-updated", { notes: props.options.notes });
};
</script>

<template>
  <v-textarea
    label="notes"
    v-model="options.notes"
    @input="updateNotes"
    @mousedown.stop
    @touchstart.stop
    hide-details
    variant="solo"
    resize="both"
    auto-grow
  ></v-textarea>
</template>

<style scoped></style>
