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
});

const stringValue = computed({
  get: () => modelValue.value.toString(),
  set: (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      modelValue.value = num;
      console.log("NumberInput: set value to", num);
    }
  },
});

const dragCallback = (deltaX: number, deltaY: number) => {
  const step = props.step;
  const mult = 2;
  const deltaValue = -Math.round(deltaY / 10) * step * mult;

  let newValue = modelValue.value + deltaValue;
  if (newValue < props.min) newValue = props.min;
  if (newValue > props.max) newValue = props.max;

  modelValue.value = newValue;
};

const { onDragElementStart, dragging } = useDragging(dragCallback);
</script>

<template>
  <span>
    <span v-if="label" class="text-medium-emphasis">{{ label }}: </span>
    <input
      type="number"
      :class="{ 'no-select': dragging, 'number-input': true }"
      v-model.lazy="stringValue"
      :min="min"
      :max="max"
      @mousedown.stop="onDragElementStart"
      @touchstart.stop="onDragElementStart"
      @dblclick.stop
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
