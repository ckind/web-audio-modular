<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import * as Tone from "tone";
import NumberInput from "../NumberInput.vue";

type SampleSlot = {
  number: number;
  name: string;
  url: string;
  pitch: number;
  detune: number;
  gain: number;
};

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);

const newSlots = ref<SampleSlot[]>([
  {
    number: 1,
    name: "Kick",
    url: "/samples/kick.wav",
    pitch: 0,
    detune: 0,
    gain: 0,
  },
  {
    number: 2,
    name: "Snare",
    url: "/samples/snare.wav",
    pitch: 0,
    detune: 0,
    gain: 0,
  },
  {
    number: 3,
    name: "HiHat",
    url: "/samples/hihat.wav",
    pitch: 0,
    detune: 0,
    gain: 0,
  },
]);

const sampleSlots = ref<SampleSlot[]>(
  Array.from({ length: 128 }, (_, i) => ({
    number: i,
    name: "empty",
    url: "",
    pitch: 0,
    detune: 0,
    gain: 0,
  })),
);

const selectedSlot = ref<SampleSlot>(sampleSlots.value[0]!);

const sampleSlotItems = computed(() =>
  sampleSlots.value.map((slot) => ({
    title: `${slot.number} - ${slot.name}`,
    value: slot,
  })),
);

const uploadSample = () => {
  const fileInput = document.getElementById("fileInput") as HTMLInputElement;
  fileInput.click();
};

onMounted(() => {
  selectedSlot.value = props.options.selectedSlot || sampleSlots.value[0];
});
</script>

<template>
  <div class="sampler-module">
    <v-select
      v-model="selectedSlot"
      :items="sampleSlotItems"
      label="sample slot"
      density="compact"
      class="mb-2"
      hide-details
    ></v-select>

    <input type="file" id="fileInput" style="display: none" />

    <!-- A regular button that the user sees and clicks -->
    <v-btn class="text-lowercase mr-2" density="compact" @click="uploadSample"
      >Upload Sample</v-btn
    >

    <number-input
      v-model="selectedSlot.pitch"
      :min="-24"
      :max="24"
      label="pitch"
      class="mr-1"
    ></number-input>
    <number-input
      v-model="selectedSlot.detune"
      :min="-50"
      :max="50"
      label="detune"
      class="mr-1"
    ></number-input>
    <number-input
      v-model="selectedSlot.gain"
      :min="-60"
      :max="12"
      label="gain (db)"
      class="mr-1"
    ></number-input>
  </div>
</template>

<style scoped>
.sampler-module {
  min-width: 12em;
}
.number-input {
  width: 1.5em;
  display: inline-block;
}
</style>
