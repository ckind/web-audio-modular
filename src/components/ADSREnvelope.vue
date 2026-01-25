<script setup lang="ts">
import { ref, computed, type PropType } from "vue";
import useDynamicSize from "@/composables/useDynamicSize";

interface AdsrSettings {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: { type: Object as PropType<AdsrSettings>, required: true },
  attackMax: { type: Number, required: false, default: 1000 },
  decayMax: { type: Number, required: false, default: 1000 },
  releaseMax: { type: Number, required: false, default: 1000 },
  width: { type: Number, required: false, default: 200 },
  height: { type: Number, required: false },
  backgroundColor: { type: String, required: false, default: "black" },
  envelopeColor: { type: String, required: false, default: "#70bfff" },
  anchorColor: { type: String, required: false, default: "#70bfff" },
  anchorRadius: { type: Number, required: false, default: 4 },
  ghostAnchorRadius: { type: Number, required: false, default: 16 },
});

const attackWidthRatio = 0.25;
const decayWidthRatio = 0.4;
const sustainWidthRatio = 0.1;
const releaseWidthRatio = 0.25;

const startX = ref(0);
const startY = ref(0);

const attackPeakX = ref(0);
const attackPeakY = ref(0);

let decayBezier1X = 0;
let decayBezier1Y = 0;
let decayBezier2X = 0;
let decayBezier2Y = 0;

const decayEndX = ref(0);
const decayEndY = ref(0);

const sustainEndX = ref(0);
const sustainEndY = ref(0);

let releaseBezier1X = 0;
let releaseBezier1Y = 0;
let releaseBezier2X = 0;
let releaseBezier2Y = 0;

const releaseEndX = ref(0);
const releaseEndY = ref(0);

const padding = 10;

const activeAnchorId = ref("");

let prevPageX = -1;
let prevPageY = -1;

const envActive = false;

const envTime = computed(() => {
  return (
    props.modelValue.attack + props.modelValue.decay + props.modelValue.release
  );
});


// todo: useDynamicSize to fit graph to container size

const containerWidth = computed(() => {
  return props.width;
});

const containerHeight = computed(() => {
  return props.height ? props.height : props.width / 2.5;
});

const graphWidth = computed(() => {
  return containerWidth.value - padding * 2;
});

const graphHeight = computed(() => {
  return containerHeight.value - padding * 2;
});

const envHeight = computed(() => {
  return graphHeight.value * 1.0;
});

const attackTotalWidth = computed(() => {
  return attackWidthRatio * graphWidth.value;
});

const attackWidth = computed(() => {
  return attackTotalWidth.value * (props.modelValue.attack / props.attackMax);
});

const decayTotalWidth = computed(() => {
  return decayWidthRatio * graphWidth.value;
});

const decayWidth = computed(() => {
  return decayTotalWidth.value * (props.modelValue.decay / props.decayMax);
});

const sustainTotalWidth = computed(() => {
  return sustainWidthRatio * graphWidth.value;
});

const releaseTotalWidth = computed(() => {
  return releaseWidthRatio * graphWidth.value;
});

const releaseWidth = computed(() => {
  return (
    releaseTotalWidth.value * (props.modelValue.release / props.releaseMax)
  );
});

const adsrPath = computed(() => {
  startX.value = padding;
  startY.value = graphHeight.value + padding;

  attackPeakX.value = attackWidth.value + padding;
  attackPeakY.value = padding;

  decayBezier1X = attackWidth.value + decayWidth.value / 4 + padding;
  decayBezier1Y =
    (graphHeight.value - graphHeight.value * props.modelValue.sustain) / 2 +
    padding;
  decayBezier2X = attackWidth.value + decayWidth.value / 2 + padding;
  decayBezier2Y =
    graphHeight.value - graphHeight.value * props.modelValue.sustain + padding;

  decayEndX.value = attackWidth.value + decayWidth.value + padding;
  decayEndY.value =
    graphHeight.value - graphHeight.value * props.modelValue.sustain + padding;

  sustainEndX.value =
    attackTotalWidth.value + decayTotalWidth.value + sustainTotalWidth.value;
  sustainEndY.value =
    graphHeight.value - graphHeight.value * props.modelValue.sustain + padding;

  releaseBezier1X =
    attackTotalWidth.value +
    decayTotalWidth.value +
    sustainTotalWidth.value +
    releaseWidth.value / 4;
  releaseBezier1Y =
    graphHeight.value -
    (graphHeight.value * props.modelValue.sustain) / 2 +
    padding;
  releaseBezier2X =
    attackTotalWidth.value +
    decayTotalWidth.value +
    sustainTotalWidth.value +
    releaseWidth.value / 2;
  releaseBezier2Y = graphHeight.value + padding;

  releaseEndX.value = sustainEndX.value + releaseWidth.value;
  releaseEndY.value = graphHeight.value + padding;

  const start = `M ${startX.value} ${startY.value} `;
  const attackCurve = `L ${attackPeakX.value} ${attackPeakY.value} `;
  const decayCurve = `C
        ${decayBezier1X}
        ${decayBezier1Y}
        ${decayBezier2X}
        ${decayBezier2Y}
        ${decayEndX.value}
        ${decayEndY.value}`;
  const sustainCurve = `L ${sustainEndX.value} ${sustainEndY.value}`;
  const releaseCurve = `C 
        ${releaseBezier1X}
        ${releaseBezier1Y} 
        ${releaseBezier2X}
        ${releaseBezier2Y}
        ${releaseEndX.value}
        ${releaseEndY.value}`;

  return start + attackCurve + decayCurve + sustainCurve + releaseCurve;
});

function attackAnchorMouseDown(e: MouseEvent | TouchEvent) {
  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
  activeAnchorId.value = "attackAnchor";
}

function decaySustainAnchorMouseDown(e: MouseEvent | TouchEvent) {
  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
  activeAnchorId.value = "decaySustainAnchor";
}

function releaseAnchorMouseDown(e: MouseEvent | TouchEvent) {
  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
  activeAnchorId.value = "releaseAnchor";
}

// todo: hard to drag values left all the way to 0
function onMove(pageX: number, pageY: number) {
  let diffX, diffY: number;
  let diffAttack = 0;
  let diffDecay = 0;
  let diffSustain = 0;
  let diffRelease = 0;

  if (activeAnchorId.value != "") {
    switch (activeAnchorId.value) {
      case "attackAnchor":
        diffX = pageX - prevPageX;
        diffAttack = (diffX / attackTotalWidth.value) * props.attackMax;
        diffAttack =
          props.modelValue.attack + diffAttack >= props.attackMax &&
          diffAttack > 0
            ? props.attackMax - props.modelValue.attack
            : props.modelValue.attack + diffAttack <= 0 && diffAttack < 0
              ? 0
              : diffAttack;
        break;
      case "decaySustainAnchor":
        diffX = pageX - prevPageX;
        diffDecay = (diffX / decayTotalWidth.value) * props.decayMax;
        diffDecay =
          props.modelValue.decay + diffDecay >= props.decayMax && diffDecay > 0
            ? props.decayMax - props.modelValue.decay
            : props.modelValue.decay + diffDecay <= 0 && diffDecay < 0
              ? 0
              : diffDecay;
        diffY = pageY - prevPageY;
        diffSustain = -(diffY / graphHeight.value);
        diffSustain =
          props.modelValue.sustain + diffSustain >= 1.0 && diffSustain > 0
            ? 1.0 - props.modelValue.sustain
            : props.modelValue.sustain + diffSustain <= 0 && diffSustain < 0
              ? 0
              : diffSustain;
        break;
      case "releaseAnchor":
        diffX = pageX - prevPageX;
        diffRelease = (diffX / releaseTotalWidth.value) * props.releaseMax;
        diffRelease =
          props.modelValue.release + diffRelease >= props.releaseMax &&
          diffRelease > 0
            ? props.releaseMax - props.modelValue.release
            : props.modelValue.release + diffRelease <= 0 && diffRelease < 0
              ? 0
              : diffRelease;
        break;
    }

    emit("update:modelValue", {
      attack: props.modelValue.attack + diffAttack,
      decay: props.modelValue.decay + diffDecay,
      sustain: props.modelValue.sustain + diffSustain,
      release: props.modelValue.release + diffRelease,
    });
  }

  prevPageX = pageX;
  prevPageY = pageY;
}

function onMouseMove(e: MouseEvent) {
  onMove(e.pageX, e.pageY);
}

function onTouchMove(e: TouchEvent) {
  if (e.touches[0]) onMove(e.touches[0].pageX, e.touches[0].pageY);
}

function onMouseUp() {
  activeAnchorId.value = "";
}

function onMouseLeave() {
  activeAnchorId.value = "";
}
</script>

<template>
  <div class="component-container">
    <div
      :class="['graph-container', activeAnchorId !== '' ? 'dragging' : '']"
      @mousemove="onMouseMove"
      @touchmove="onTouchMove"
      @mouseup="onMouseUp"
      @touchend="onMouseUp"
      @mouseleave="onMouseLeave"
      :width="containerWidth"
      :height="containerHeight"
    >
      <svg :width="containerWidth" :height="containerHeight">
        <rect
          :width="containerWidth"
          :height="containerHeight"
          :fill="backgroundColor"
        />
        <path
          id="envPath"
          :d="adsrPath"
          fill="transparent"
          :stroke="envelopeColor"
          stroke-width="2"
        />

        <!-- Start -->
        <circle
          class="anchor"
          :cx="startX"
          :cy="startY"
          :r="anchorRadius"
          :stroke="anchorColor"
          :fill="anchorColor"
        />
        <!-- Attack -->
        <circle
          class="anchor"
          id="attackAnchorGhost"
          @mousedown="attackAnchorMouseDown"
          @touchstart="attackAnchorMouseDown"
          :cx="attackPeakX"
          :cy="attackPeakY"
          :r="ghostAnchorRadius"
          :stroke="'rgba(0, 0, 0, 0)'"
          :fill="'rgba(0, 0, 0, 0)'"
        />
        <circle
          class="anchor"
          id="attackAnchor"
          @mousedown="attackAnchorMouseDown"
          @touchstart="attackAnchorMouseDown"
          :cx="attackPeakX"
          :cy="attackPeakY"
          :r="anchorRadius"
          :stroke="anchorColor"
          :fill="anchorColor"
        />
        <!-- Decay/Sustain -->
        <circle
          class="anchor"
          id="decaySustainAnchorGhost"
          @mousedown="decaySustainAnchorMouseDown"
          @touchstart="decaySustainAnchorMouseDown"
          :cx="decayEndX"
          :cy="decayEndY"
          :r="ghostAnchorRadius"
          :stroke="'rgba(0, 0, 0, 0)'"
          :fill="'rgba(0, 0, 0, 0)'"
        />
        <circle
          class="anchor"
          id="decaySustainAnchor"
          @mousedown="decaySustainAnchorMouseDown"
          @touchstart="decaySustainAnchorMouseDown"
          :cx="decayEndX"
          :cy="decayEndY"
          :r="anchorRadius"
          :stroke="anchorColor"
          :fill="anchorColor"
        />
        <!-- Release -->
        <circle
          class="anchor"
          id="releaseAnchorGhost"
          @mousedown="releaseAnchorMouseDown"
          @touchstart="releaseAnchorMouseDown"
          :cx="releaseEndX"
          :cy="releaseEndY"
          :r="ghostAnchorRadius"
          :stroke="'rgba(0, 0, 0, 0)'"
          :fill="'rgba(0, 0, 0, 0)'"
        />
        <circle
          class="anchor"
          id="releaseAnchor"
          @mousedown="releaseAnchorMouseDown"
          @touchstart="releaseAnchorMouseDown"
          :cx="releaseEndX"
          :cy="releaseEndY"
          :r="anchorRadius"
          :stroke="anchorColor"
          :fill="anchorColor"
        />
      </svg>
      <div class="value-label-container">
        <div class="value-label">{{ Math.round(modelValue.attack) }} ms</div>
        <div class="value-label">{{ Math.round(modelValue.decay) }} ms</div>
        <div class="value-label">{{ modelValue.sustain.toFixed(2) }}</div>
        <div class="value-label">{{ Math.round(modelValue.release) }} ms</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.graph-container {
  display: inline-block;
  margin: auto;
  width: -webkit-fit-content;
  width: fit-content;
}
svg {
  display: block;
}
#attackAnchorGhost,
#attackAnchor {
  cursor: ew-resize;
}
#decaySustainAnchorGhost,
#decaySustainAnchor {
  cursor: move;
}
#releaseAnchorGhost,
#releaseAnchor {
  cursor: ew-resize;
}
.dragging {
  cursor: none;
}
.value-label {
  display: block;
  float: left;
  margin: 0 0.5em 0 0.5em;
  user-select: none;
}
.value-label-container {
  display: flex;
  justify-content: space-evenly;
}
.component-container {
  justify-content: center;
  display: flex;
}
</style>
