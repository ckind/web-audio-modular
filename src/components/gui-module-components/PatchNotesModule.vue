<script setup lang="ts">
import { type PropType, computed } from "vue";
import type { PatchNotesModuleOptions } from "@/classes/audio-modules/PatchNotesModule";

const props = defineProps({
  options: {
    type: Object as PropType<PatchNotesModuleOptions>,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);

const notes = computed({
  get() {
    return props.options.notes;
  },
  set(value) {
    emit("options-updated", { notes: value });
  }
});

</script>

<template>
  <v-textarea
    label="notes"
    v-model="notes"
    @mousedown.stop
    @touchstart.stop
    hide-details
    variant="solo"
    resize="both"
    auto-grow
  ></v-textarea>
</template>