<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, type PropType } from "vue";
import type {
  SamplerModuleOptions,
  SampleSlot,
} from "@/classes/audio-modules/SamplerModule";
import NumberInput from "@/components/NumberInput.vue";

const props = defineProps({
  options: {
    type: Object as PropType<SamplerModuleOptions>,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);

const sampleSlotItems = computed(() =>
  props.options.sampleSlots.map((slot) => ({
    title: `${slot.number} - ${slot.name}`,
    value: slot.number,
  })),
);

const fileInput = useTemplateRef<HTMLInputElement>("fileInput");

const uploadSample = () => {
  fileInput.value?.click();
};

onMounted(() => {
  fileInput.value?.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          props.options.sampleSlots[props.options.selectedSlotIndex]!.url =
            result;
          props.options.sampleSlots[props.options.selectedSlotIndex]!.name =
            file.name;
          emit("options-updated", { sampleSlots: props.options.sampleSlots });
        }
      };
      reader.readAsDataURL(file);
    }
  });
});
</script>

<template>
  <div class="sampler-module">
    <v-select
      v-model="props.options.selectedSlotIndex"
      :items="sampleSlotItems"
      label="sample slot"
      density="compact"
      class="mb-2"
      hide-details
    ></v-select>

    <input ref="fileInput" type="file" id="fileInput" style="display: none" />

    <div class="mb-1">
      <v-btn
        class="sampler-button text-lowercase mr-2"
        density="compact"
        @click="uploadSample"
      >
        upload
      </v-btn>

      <number-input
        v-model="
          props.options.sampleSlots[props.options.selectedSlotIndex]!.pitch
        "
        :min="-24"
        :max="24"
        label="pitch"
        class="mr-1"
      />
      <number-input
        v-model="
          props.options.sampleSlots[props.options.selectedSlotIndex]!.detune
        "
        :min="-50"
        :max="50"
        label="detune"
        class="mr-1"
      />
      <number-input
        v-model="
          props.options.sampleSlots[props.options.selectedSlotIndex]!.gain
        "
        :min="-60"
        :max="12"
        label="gain (db)"
        class="mr-1"
      />
    </div>

    <div>
      <v-btn
        class="sampler-button text-lowercase mr-2"
        density="compact"
        @click="uploadSample"
      >
        clear
      </v-btn>
    </div>

    <v-divider class="my-2"></v-divider>
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
.sampler-button {
  width: 6em;
}
</style>
