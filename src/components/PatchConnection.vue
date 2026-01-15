<script setup lang="ts">
import { type PropType, onUnmounted } from "vue";
import type { ConnectionInstance } from "@/types/patchTypes";
import PatchCable from "./PatchCable.vue";

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

const disconnect = (connection: ConnectionInstance) => {
  connection.from.output.moduleOutput.disconnect(
    connection.to.input.moduleInput
  );
};

onUnmounted(() => {
  disconnect(props.connection);
});
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
