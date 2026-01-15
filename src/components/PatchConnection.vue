<script setup lang="ts">
import { type PropType } from "vue";
import type { ConnectionInstance } from "@/types/patchWindowTypes";

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
  <g>
    <!-- line -->
    <line
      :x1="connection.from.output.position.x"
      :y1="connection.from.output.position.y"
      :x2="connection.to.input.position.x"
      :y2="connection.to.input.position.y"
      :stroke="connection.selected ? 'white' : 'gray'"
      stroke-width="3"
      stroke-linecap="round"
      class="cursor-pointer"
      @click.stop="connectionClick"
    />

    <!-- end points -->
    <circle
      :cx="connection.from.output.position.x"
      :cy="connection.from.output.position.y"
      r="5"
      fill="#fff"
    />
    <circle
      :cx="connection.to.input.position.x"
      :cy="connection.to.input.position.y"
      r="5"
      fill="#fff"
    />
  </g>
</template>

<style scoped></style>
