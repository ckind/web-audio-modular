<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAppColors } from "@/store/appColors";

const appColors = useAppColors();

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const value = ref(props.options.value ?? 0.5);
const isDragging = ref(false);
const startY = ref(0);
const startValue = ref(0);
const DRAG_RANGE = 150;

const emit = defineEmits(["options-updated"]);

const angle = computed(() => {
  const min = props.options.min ?? 0;
  const max = props.options.max ?? 1;
  const normalizedValue = (value.value - min) / (max - min);

  const startAngle = 135;
  const sweep = 270;

  return startAngle + normalizedValue * sweep; // can exceed 360 (fine)
});

// Arc path for the indicator
const arcPath = computed(() => {
  const radius = 35;

  const startAngle = 135;
  const endAngle = angle.value;

  const angleRange = endAngle - startAngle;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = 50 + radius * Math.cos(startRad);
  const y1 = 50 + radius * Math.sin(startRad);
  const x2 = 50 + radius * Math.cos(endRad);
  const y2 = 50 + radius * Math.sin(endRad);

  // If we've swept more than half the circle, use the large arc (e.g. up to 270°).
  const largeArc = angleRange > 180 ? 1 : 0;

  // Sweep flag 1 = clockwise in SVG's coordinate system (y down).
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
});

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  startY.value = e.clientY;
  startValue.value = value.value;
  e.preventDefault();
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  
  const min = props.options.min ?? 0;
  const max = props.options.max ?? 1;
  const sensitivity = (max - min) / DRAG_RANGE;
  
  const deltaY = startY.value - e.clientY; // Inverted: up increases value
  const newValue = startValue.value + deltaY * sensitivity;
  
  value.value = Math.max(min, Math.min(max, newValue));
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handleDoubleClick = () => {
  const min = props.options.min ?? 0;
  const max = props.options.max ?? 1;
  value.value = (min + max) / 2; // Reset to middle
};

watch(value, (newValue) => {
  emit("options-updated", { value: Number(newValue) });
});

// Add global listeners for mouse move and up
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
}
</script>

<template>
  <div class="rotary-knob-container">
    <svg
      class="rotary-knob"
      viewBox="5 5 90 90"
      width="70"
      height="70"
      @mousedown="handleMouseDown"
      @dblclick="handleDoubleClick"
      @mousedown.stop
      @touchstart.stop
    >
      <!-- Background circle -->
      <circle
        class="knob-ring"
        cx="50"
        cy="50"
        r="38"
        fill="none"
        :stroke="appColors.backgroundColor"
        stroke-width="2"
      />

      <!-- Value arc (active portion) -->
      <path
        class="knob-arc"
        :d="arcPath"
        fill="none"
        :stroke="appColors.signalColor"
        stroke-width="4"
        stroke-linecap="round"
      />
      
      <!-- Center knob -->
      <circle
        class="knob-face"
        cx="50"
        cy="50"
        r="30"
        :fill="isDragging ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)'"
        :stroke="appColors.textColor"
        stroke-width="1"
      />
      
      <!-- Indicator line -->
      <line
        class="knob-indicator"
        :x1="50"
        :y1="50"
        :x2="50 + 25 * Math.cos((angle * Math.PI) / 180)"
        :y2="50 + 25 * Math.sin((angle * Math.PI) / 180)"
        :stroke="appColors.signalColor"
        stroke-width="4"
        stroke-linecap="round"
      />
      
      <!-- Center dot -->
      <circle
        class="knob-dot"
        cx="50"
        cy="50"
        r="3"
        :fill="appColors.textColor"
      />
    </svg>
  </div>
</template>

<style scoped>
.rotary-knob-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  user-select: none;
}

.rotary-knob {
  cursor: pointer;
  transition: filter 0.1s ease;
}

.rotary-knob:hover {
  filter: brightness(1.1);
}

.rotary-knob:active {
  cursor: grabbing;
}

/* Light mode refinements */
:global(.theme-light) .rotary-knob {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.12));
}

:global(.theme-light) .rotary-knob .knob-ring {
  stroke: #c7cbd1 !important;
}

:global(.theme-light) .rotary-knob .knob-face {
  stroke: #7a828c !important;
  fill: rgba(0, 0, 0, 0.03) !important;
}

:global(.theme-light) .rotary-knob .knob-arc {
  stroke: #2b7abf !important;
}

:global(.theme-light) .rotary-knob .knob-indicator {
  stroke: #2b7abf !important;
}

:global(.theme-light) .rotary-knob .knob-dot {
  fill: #4a4f55 !important;
}

.value-display {
  font-size: 11px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.6);
  min-width: 50px;
  text-align: center;
}
</style>
