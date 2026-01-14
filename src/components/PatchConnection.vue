<script setup lang="ts">
import { type PropType } from "vue";
import type { ConnectionInstance, Position } from "@/components/PatchWindow.vue";

const props = defineProps({
  patcherWindowWidth: {
    type: Number,
    required: true,
  },
  patcherWindowHeight: {
    type: Number,
    required: true,
  },
  connection: {
    type: Object as PropType<ConnectionInstance>,
    required: true,
  },
});
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="`0 0 ${patcherWindowWidth} ${patcherWindowHeight}`"
    :width="patcherWindowWidth"
    :height="patcherWindowHeight"
  >
    <!-- line -->
    <line
      :x1="connection.from.output.position.x"
      :y1="connection.from.output.position.y"
      :x2="connection.to.input.position.x"
      :y2="connection.to.input.position.y"
      stroke="#fff"
      stroke-width="2"
      stroke-linecap="round"
    />

    <!-- end points -->
    <circle
      :cx="connection.from.output.position.x"
      :cy="connection.from.output.position.y"
      r="6"
      fill="#fff"
    />
    <circle
      :cx="connection.to.input.position.x"
      :cy="connection.to.input.position.y"
      r="6"
      fill="#fff"
    />
  </svg>
</template>

<style scoped></style>
