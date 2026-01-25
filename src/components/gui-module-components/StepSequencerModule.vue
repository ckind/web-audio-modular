<script setup lang="ts">
import { type PropType, watch, ref } from "vue";
import { useAppColors } from "@/store/appColors";
import type { StepSequencerModuleOptions } from "@/classes/audio-modules/StepSequencerModule";
import useDragging from "@/composables/useDragging";

const appColors = useAppColors();

const props = defineProps({
  options: {
    type: Object as PropType<StepSequencerModuleOptions>,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);

const sequenceRows = ref<number[][]>([
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]);
const setStep = (row: number, col: number, value: number) => {
  sequenceRows.value[row]![col]! = value;
};
const toggleStep = (row: number, col: number) => {
  sequenceRows.value[row]![col]! = sequenceRows.value[row]![col]! > 0 ? 0 : 1;
  emit("options-updated", { sequence: sequenceRows.value.flat() });
};

watch(
  () => props.options.sequence,
  () => {
    for (let i = 0; i < props.options.sequence.length; i++) {
      setStep(Math.floor(i / 16), i % 16, props.options.sequence[i]!);
    }
  },
  { immediate: true },
);

const isCurrentStep = (row: number, col: number): boolean => {
  switch (props.options.mode) {
    case "1x64":
      return false;
    case "2x32":
      return false;
    case "4x16":
      return props.options.currentIndex === col;
  }
};

const draw = (row: number, col: number) => {
  if (dragging.value) {
    toggleStep(row, col);
  }
};

const { onDragElementStart, dragging } = useDragging(() => {});
</script>

<template>
  <div
    class="step-sequencer-module"
    @mousedown.stop="onDragElementStart"
    @touchstart.stop="onDragElementStart"
  >
    <div class="d-flex flex-column">
      <div v-for="(row, r) in sequenceRows" class="d-flex flex-row">
        <div
          v-for="(value, c) in row"
          :key="'step-' + 16 * r + c"
          class="step-box"
          :class="{ active: value > 0 }"
          :style="{
            backgroundColor: appColors.signalColor,
            border: isCurrentStep(r, c)
              ? `3px solid ${appColors.messageBusColor}`
              : 'none',
          }"
          @click="toggleStep(r, c)"
          @mouseover="draw(r, c)"
          @touchmove="draw(r, c)"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-sequencer-module {
  cursor: crosshair;
}
.step-box {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  margin: 0.25em;
  opacity: 0.3;
  cursor: crosshair;
}
.step-box.active {
  opacity: 1;
  cursor: crosshair;
}
</style>
