<script setup lang="ts">
import { computed } from "vue";
import useDragging from "@/composables/useDragging";

const modelValue = defineModel({
  type: Number,
  required: true,
});

const props = defineProps({
  label: {
    type: String,
    required: false,
  },
  min: {
    type: Number,
    required: false,
    default: -Infinity,
  },
  max: {
    type: Number,
    required: false,
    default: Infinity,
  },
  step: {
    type: Number,
    required: false,
    default: 1,
  },
  inputWidth: {
    type: Number,
    required: false,
    default: 60,
  },
});

const DRAG_RANGE = 100; // pixels for full range drag

const stringValue = computed({
  get: () => modelValue.value.toString(),
  set: (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      modelValue.value = num;
    }
  },
});

const roundToStep = (value: number, step: number) => {
  return Math.round(value / step) * step;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};  

const dragCallback = (deltaX: number, deltaY: number) => {
  modelValue.value = roundToStep(
    clamp(
      modelValue.value + (-deltaY / DRAG_RANGE) * ((props.max - props.min)/ 2),
      props.min,
      props.max
    ),
    props.step
  );
}

const { onDragElementStart, dragging } = useDragging(dragCallback);
</script>

<template>
  <span>
    <span v-if="label" class="text-medium-emphasis">{{ label }}: </span>
    <input
      v-model.lazy="stringValue"
      :style="{ width: `${inputWidth}px`}"
      :class="{ 'no-select': dragging, 'number-input': true }"
      :min="min"
      :max="max"
      @mousedown.stop="onDragElementStart"
      @touchstart.stop="onDragElementStart"
      @dblclick.stop
      type="number"
    />
  </span>
</template>

<style scoped>
.number-input {
  display: inline-block;
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

/* todo: this doesn't seem to work inside input fields? */
.no-select {
  -webkit-touch-callout: none !important; /* iOS Safari */
  -webkit-user-select: none !important; /* Safari, Chrome, Opera, Android */
  -moz-user-select: none !important; /* Firefox */
  -ms-user-select: none !important; /* Internet Explorer/Edge */
  user-select: none !important; /* Standard syntax */
}
</style>
