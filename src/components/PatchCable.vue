<script setup lang="ts">
import { type PropType, ref, computed } from "vue";
import type { Position } from "@/types/uIInstanceTypes";
import type { ConnectionType } from "@/types/connectionTypes";
import useConnectionTypeColors from "@/composables/useConnectionTypeColors"

const { signalColor, messageBusColor } = useConnectionTypeColors();

const lineColor = computed(() => {
  return props.connectionType === "signal" ? signalColor : messageBusColor;
});

const nodeColor = computed(() => {
  return props.connectionType === "signal" ? signalColor : messageBusColor;
});

const lineOpacity = computed(() => {
  return props.selected ? 1 : 0.5;
})

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
  },
  connectionType: {
    type: String as PropType<ConnectionType>,
    required: true,
  },
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
      :stroke="lineColor"
      :stroke-opacity="lineOpacity"
      stroke-width="3"
      stroke-linecap="round"
      pointer-events="none"
    />

    <!-- end points -->
    <circle
      :cx="startPosition.x"
      :cy="startPosition.y"
      r="5"
      :fill="nodeColor"
    />
    <circle :cx="endPosition.x" :cy="endPosition.y" r="5" :fill="nodeColor" />
  </g>
</template>

<style scoped></style>
