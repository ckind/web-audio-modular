<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  useTemplateRef,
  type PropType,
  watch,
} from "vue";
import type { MonoSynthModuleOptions } from "@/classes/audio-modules/SynthMonoModule";
import NumberInput from "@/components/NumberInput.vue";
import ADSREnvelope from "../ADSREnvelope.vue";
import { useAppColors } from "@/store/appColors";
import { BiquadFilter } from "tone";

const appColors = useAppColors();

const props = defineProps({
  options: {
    type: Object as PropType<MonoSynthModuleOptions>,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);

const localOptions = ref<MonoSynthModuleOptions>({ ...props.options });

const oscillatorTypes = ref(["sine", "square", "sawtooth", "triangle"]);
const noiseTypes = ref(["white", "pink", "brown"]);
const filterTypes = ref([
  "lowpass",
  "highpass",
  "bandpass",
  "lowshelf",
  "highshelf",
  "notch",
  "peaking",
]);
const filterRolloffs = ref([-12, -24, -48, -96]);

const node = new BiquadFilter();

const envelopeTab = ref("ampEnvelope");
const oscillatorTab = ref("osc1");
const filterAndModTab = ref("filter");

watch(
  () => localOptions.value,
  (newOptions) => {
    emit("options-updated", newOptions);
  },
  { deep: true },
);

const ampEnvelope = computed({
  // convert seconds to milliseconds for the envelope component
  get() {
    return {
      attack: props.options.ampEnvAttack * 1000,
      decay: props.options.ampEnvDecay * 1000,
      sustain: props.options.ampEnvSustain,
      release: props.options.ampEnvRelease * 1000,
    };
  },
  set(newEnvelope) {
    localOptions.value = {
      ...localOptions.value,
      ampEnvAttack: newEnvelope.attack / 1000,
      ampEnvDecay: newEnvelope.decay / 1000,
      ampEnvSustain: newEnvelope.sustain,
      ampEnvRelease: newEnvelope.release / 1000,
    };
  },
});

const filterEnvelope = computed({
  // convert seconds to milliseconds for the envelope component
  get() {
    return {
      attack: props.options.filterEnvAttack * 1000,
      decay: props.options.filterEnvDecay * 1000,
      sustain: props.options.filterEnvSustain,
      release: props.options.filterEnvRelease * 1000,
    };
  },
  set(newEnvelope) {
    localOptions.value = {
      ...localOptions.value,
      filterEnvAttack: newEnvelope.attack / 1000,
      filterEnvDecay: newEnvelope.decay / 1000,
      filterEnvSustain: newEnvelope.sustain,
      filterEnvRelease: newEnvelope.release / 1000,
    };
  },
});

onMounted(() => {});
</script>

<template>
  <div class="mono-synth-module d-flex flex-row pa-1">
    <div>
      <!-- oscillators -->
      <v-tabs
        class="synth-tabs"
        density="compact"
        color="secondary"
        v-model="oscillatorTab"
      >
        <v-tab class="text-lowercase" value="osc1">osc 1</v-tab>
        <v-tab class="text-lowercase" value="osc2">osc 2</v-tab>
        <v-tab class="text-lowercase" value="noise">noise</v-tab>
      </v-tabs>

      <v-tabs-window v-model="oscillatorTab">
        <v-tabs-window-item value="osc1">
          <div class="d-flex justify-content-center align-center my-2">
            <span class="me-2">type:</span>
            <v-select
              density="compact"
              v-model="localOptions.oscillator1Type"
              :items="oscillatorTypes"
              dense
              hide-details
            />
          </div>
          <div class="d-flex justify-content-center align-center mb-2">
            <NumberInput
              label="pitch"
              v-model="localOptions.oscillator1Tuning"
              :min="-24"
              :max="24"
              :inputWidth="40"
            />
            <NumberInput
              label="detune"
              v-model="localOptions.oscillator1Detune"
              :min="-50"
              :max="50"
              :inputWidth="40"
            />
            <NumberInput
              label="gain"
              v-model="localOptions.oscillator1Volume"
              :min="-60"
              :max="0"
              :inputWidth="40"
            />
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="osc2">
          <div class="d-flex justify-content-center align-center my-2">
            <span class="me-2">type:</span>
            <v-select
              density="compact"
              v-model="localOptions.oscillator2Type"
              :items="oscillatorTypes"
              dense
              hide-details
            />
          </div>
          <div class="d-flex justify-content-center align-center mb-2">
            <NumberInput
              label="pitch"
              v-model="localOptions.oscillator2Tuning"
              :min="-24"
              :max="24"
              :inputWidth="40"
            />
            <NumberInput
              label="detune"
              v-model="localOptions.oscillator2Detune"
              :min="-50"
              :max="50"
              :inputWidth="40"
            />
            <NumberInput
              label="gain"
              v-model="localOptions.oscillator2Volume"
              :min="-60"
              :max="0"
              :inputWidth="40"
            />
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="noise">
          <div class="d-flex justify-content-center align-center my-2">
            <span class="me-2">type:</span>
            <v-select
              density="compact"
              v-model="localOptions.noiseType"
              :items="noiseTypes"
              dense
              hide-details
            />
          </div>
          <div class="d-flex justify-content-center align-center mb-2">
            <NumberInput
              label="gain"
              v-model="localOptions.noiseVolume"
              :min="-60"
              :max="0"
              :inputWidth="100"
            />
          </div>
        </v-tabs-window-item>
      </v-tabs-window>

      <v-divider class="my-2" />

      <!-- envelopes -->
      <v-tabs
        class="synth-tabs"
        density="compact"
        color="secondary"
        v-model="envelopeTab"
      >
        <v-tab class="text-lowercase" value="ampEnvelope">amp env</v-tab>
        <v-tab class="text-lowercase" value="filterEnvelope">filter env</v-tab>
      </v-tabs>

      <v-tabs-window v-model="envelopeTab">
        <v-tabs-window-item value="ampEnvelope">
          <a-d-s-r-envelope
            class="envelope"
            @mousedown.stop
            @touchstart.stop
            v-model="ampEnvelope"
            :height="90"
            :width="250"
            :background-color="appColors.backgroundColor"
            :envelope-color="appColors.signalColor"
            :anchor-color="appColors.signalColor"
          />
        </v-tabs-window-item>
        <v-tabs-window-item value="filterEnvelope">
          <a-d-s-r-envelope
            class="envelope"
            @mousedown.stop
            @touchstart.stop
            v-model="filterEnvelope"
            :height="90"
            :width="250"
            :background-color="appColors.backgroundColor"
            :envelope-color="appColors.signalColor"
            :anchor-color="appColors.signalColor"
          />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <v-divider vertical class="mx-2" />

    <!-- filter and modulations -->
    <div>
      <v-tabs
        class="synth-tabs"
        density="compact"
        color="secondary"
        v-model="filterAndModTab"
      >
        <v-tab class="text-lowercase" value="filter">filter</v-tab>
        <v-tab class="text-lowercase" value="mod">mod</v-tab>
      </v-tabs>

      <v-tabs-window v-model="filterAndModTab">
        <v-tabs-window-item value="filter">
          <div class="d-flex justify-content-center align-center my-2">
            <span class="me-2 filter-label">type:</span>
            <v-select
              density="compact"
              v-model="localOptions.filterType"
              :items="filterTypes"
              dense
              hide-details
            />
          </div>
          <div class="d-flex justify-content-center align-center my-2">
            <span class="me-2 filter-label">rolloff:</span>
            <v-select
              density="compact"
              v-model="localOptions.filterRolloff"
              :items="filterRolloffs"
              dense
              hide-details
            />
          </div>
          
          <div class="d-flex justify-content-center align-center my-4">
            <span class="me-2 filter-label">frequency:</span>
            <input
              v-model="localOptions.filterFrequency"
              type="range"
              :min="20"
              :max="20000"
              :step="1"
              :style="{ accentColor: appColors.signalColor }"
              @mousedown.stop
              @touchstart.stop
            />
          </div>
          <div class="d-flex justify-content-center align-center my-4">
            <span class="me-2 filter-label">resonance:</span>
            <input
              v-model="localOptions.filterQ"
              type="range"
              :min="1"
              :max="10"
              :step="0.01"
              :style="{ accentColor: appColors.signalColor }"
              @mousedown.stop
              @touchstart.stop
            />
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="mod"> </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </div>
</template>

<style scoped>
.number-input {
  width: 6em;
}
.sampler-button {
  width: 6em;
}
.envelope {
  font-size: 0.85em;
}
.filter-label {
  width: 5em;
}
</style>
