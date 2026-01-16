<script setup lang="ts">
import { type PropType, onUnmounted } from "vue";
import type { Position } from "@/types/patchTypes";

const props = defineProps({
  startPosition: {
    type: Object as PropType<Position>,
    required: true,
  },
  endPosition: {
    type: Object as PropType<Position>,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(["cable-selected"]);

const cableClick = () => {
  emit("cable-selected");
};
</script>

<template>
  <g>
    <!-- invisible hitbox line -->
    <line
      :x1="startPosition.x"
      :y1="startPosition.y"
      :x2="endPosition.x"
      :y2="endPosition.y"
      stroke="transparent"
      stroke-width="15"
      stroke-linecap="round"
      class="cursor-pointer"
      @click.stop="cableClick"
    />

    <!-- visible line -->
    <line
      :x1="startPosition.x"
      :y1="startPosition.y"
      :x2="endPosition.x"
      :y2="endPosition.y"
      :stroke="selected ? 'white' : 'gray'"
      stroke-width="3"
      stroke-linecap="round"
      pointer-events="none"
    />


    <!-- end points -->
    <circle
      :cx="startPosition.x"
      :cy="startPosition.y"
      r="5"
      fill="#fff"
    />
    <circle
      :cx="endPosition.x"
      :cy="endPosition.y"
      r="5"
      fill="#fff"
    />
  </g>
</template>

<style scoped></style>
