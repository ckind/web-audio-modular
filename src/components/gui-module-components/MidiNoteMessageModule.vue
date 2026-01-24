<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import type { MidiNoteMessageModuleOptions, MidiNoteMessageGUIState } from "@/classes/audio-modules/MidiNoteMessageModule";

const props = defineProps({
  options: {
    type: Object as PropType<MidiNoteMessageModuleOptions>,
    required: true,
  },
  guiState: {
    type: Object as PropType<MidiNoteMessageGUIState>,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);
const listening = ref(false);

watch(
  () => props.guiState,
  (newGuiState) => {
    listening.value = newGuiState?.listening ?? false;
  },
  { immediate: true, deep: true },
);

const listen = () => {
  listening.value = true;
  emit("options-updated", { listenForChannel: true });
};

const onOptionsUpdated = (newOptions: MidiNoteMessageModuleOptions) => {
  emit("options-updated", newOptions);
};
</script>

<template>
  <div>
    <v-btn
      :disabled="listening"
      density="compact"
      @click="listen"
      class="mr-2 text-lowercase"
    >
      {{ listening ? "Listening..." : "map channel" }}
    </v-btn>
    <patch-module-options-input
      :disabled="listening"
      :options="props.options"
      @options-updated="onOptionsUpdated"
    ></patch-module-options-input>
  </div>
</template>
