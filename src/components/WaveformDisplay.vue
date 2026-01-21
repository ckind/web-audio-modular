<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useAppColors } from "@/store/appColors";
import { useTheme } from "vuetify";
import { useUserSettings } from "@/store/userSettings";

const appColors = useAppColors();
const theme = useTheme();
const userSettings = useUserSettings();

type Bin = {
  min: number;
  max: number;
};

// sample amplitudes are evenly distributed into bins based on the graph size
// each bin contains calculations for what to draw at each x coordinate of the graph
let bins: Bin[] = [];

const MAX_ZOOM_AMOUNT = 512; // max multipler for the zoom window
const ZOOM_INDEX = 0; // the start index (in samples) of the zoom window
const BIN_WIDTH = 2; // how wide to draw each bin on the graph

// Props
const props = defineProps({
  amplitudeData: {
    type: Float32Array,
    required: true,
  },
  width: {
    type: Number,
    required: false,
    default: 500,
  },
  height: {
    type: Number,
    required: false,
    default: 150,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

// Reactive state
const visualizer = ref<HTMLCanvasElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const canvasContext = ref<CanvasRenderingContext2D | null>(null);
const zoomMult = ref(1);

// Computed properties
const graphWidth = computed(() => props.width);
const graphHeight = computed(() => props.height);

function getNumBins() {
  // todo: rounding errors?
  return Math.ceil(graphWidth.value / BIN_WIDTH);
}

function getSamplesPerBin(amplitudeDataLength: number, numBins: number) {
  // todo: how to handle rounding errors in samplesPerBin?
  // for now, just ignore the remainder samples at the end of the array
  // should we append bins to the end?
  return Math.floor(amplitudeDataLength / numBins);
}

// computes the min and max values between the start and end index of the sample data
function getMinMaxSampleValues(
  sampleData: Float32Array,
  startIndex: number,
  endIndex: number,
) {
  const start = startIndex;
  const end = endIndex;

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = start; i < end; i++) {
    const value = sampleData[i]!;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return { min, max };
}

function computeBinValues(
  sampleData: Float32Array,
  samplesPerBin: number,
  numBins: number,
): Bin[] {
  const newBins = new Array(numBins);

  // todo: account for zoom?

  for (let i = 0; i < numBins; i++) {
    const startIndex = i * samplesPerBin;
    const endIndex = (i + 1) * samplesPerBin;

    const { min, max } = getMinMaxSampleValues(
      sampleData,
      startIndex,
      endIndex,
    );

    newBins[i] = {
      min: min,
      max: max,
    };
  }

  return newBins;
}

// returns number with max abs value
// favors positive value if a = -b or vice versa
function absMax(a: number, b: number) {
  const absA = Math.abs(a);
  const absB = Math.abs(b);

  if (absA > absB) {
    return a;
  } else if (absB > absA) {
    return b;
  } else {
    return Math.max(a, b);
  }
}

function zoomOut() {
  zoomMult.value = Math.max(zoomMult.value / 2, 1);
}

function zoomIn() {
  zoomMult.value = Math.min(zoomMult.value * 2, MAX_ZOOM_AMOUNT);
}

// todo: this doesn't look very nice for short samples
function drawAmplitude() {
  let miny = 0;
  let maxy = 0;
  let columnWidth = BIN_WIDTH > 1 ? BIN_WIDTH - 1 : 1;
  let bin: Bin;
  let binIndex = 0;

  const fillColor =
    theme.global.name.value === "dark"
      ? appColors.signalColor
      : appColors.messageBusColor;

  // loop through the x-axis and draw a column for each bin
  for (let x = 0; x < graphWidth.value; x += BIN_WIDTH) {
    bin = bins[binIndex] ?? {
      min: 0,
      max: 0,
    };

    miny =
      graphHeight.value -
      (graphHeight.value / 2 + (bin.min * graphHeight.value) / 2);

    maxy =
      graphHeight.value -
      (graphHeight.value / 2 + (bin.max * graphHeight.value) / 2);

    canvasContext.value!.fillStyle = fillColor;
    canvasContext.value?.fillRect(x, miny, columnWidth, absMax(maxy - miny, 1));

    binIndex++;
  }
}

function drawBackground() {
  // canvasContext.value!.fillStyle = appColors.messageBusColor;
  // canvasContext.value?.fillRect(0, 0, graphWidth.value, graphHeight.value);
}

function clearCanvas() {
  canvasContext.value?.setTransform(1, 0, 0, 1, 0, 0);
  canvasContext.value?.clearRect(0, 0, graphWidth.value, graphHeight.value);
}

function draw() {
  clearCanvas();
  drawBackground();
  drawAmplitude();
}

onMounted(() => {
  canvas.value = visualizer.value as HTMLCanvasElement;
  canvasContext.value = canvas.value.getContext("2d");

  const numBins = getNumBins();
  const samplesPerBin = getSamplesPerBin(props.amplitudeData.length, numBins);

  computeBinValues(props.amplitudeData, samplesPerBin, numBins);

  draw();
});

watch(
  () => props.amplitudeData,
  (newValue) => {
    const numBins = getNumBins();
    const samplesPerBin = getSamplesPerBin(newValue.length, numBins);

    bins = computeBinValues(newValue, samplesPerBin, numBins);

    draw();
  },
);

watch(
  () => userSettings.isDarkMode,
  () => {
    draw();
  },
);
</script>

<template>
  <div class="d-flex align-center">
    <canvas
      ref="visualizer"
      class="visualizer-canvas"
      :width="width"
      :height="height"
    ></canvas>
    <!-- <div>
      <v-row class="ma-0 pa-0">
        <v-btn
          icon="mdi-plus"
          @click="zoomIn"
          size="small"
          variant="text"
          :disabled="disabled"
        />
      </v-row>
      <v-row class="ma-0 pa-0">
        <v-btn
          icon="mdi-minus"
          @click="zoomOut"
          size="small"
          variant="text"
          :disabled="disabled"
        />
      </v-row>
    </div> -->
  </div>
</template>

<style scoped>
.visualizer-canvas {
  display: inline-block;
  cursor: move;
}
</style>
