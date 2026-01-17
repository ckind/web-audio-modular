<script setup lang="ts">
import { type PropType, onUnmounted } from "vue";
import type { ConnectionInstance } from "@/types/patchTypes";
import PatchCable from "@/components/PatchCable.vue";

const props = defineProps({
  connection: {
    type: Object as PropType<ConnectionInstance>,
    required: true,
  },
});

const emit = defineEmits(["selected"]);

const connectionClick = () => {
  emit("selected");
};

</script>

<template>
  <PatchCable
    :startPosition="connection.from.output.position"
    :endPosition="connection.to.input.position"
    :selected="connection.selected"
    @cable-selected="connectionClick"
  />
</template>

<style scoped></style>
