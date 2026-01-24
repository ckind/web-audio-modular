<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import type {
  MidiCCToSignalModuleOptions,
  MidiCCToSignalGUIState,
} from "@/classes/audio-modules/MidiCCModule";

const props = defineProps({
  options: {
    type: Object as PropType<MidiCCToSignalModuleOptions>,
    required: true,
  },
  guiState: {
    type: Object as PropType<MidiCCToSignalGUIState>,
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
  emit("options-updated", {
    listenForChannelAndControl: true,
  });
};

const onOptionsUpdated = (newOptions: MidiCCToSignalModuleOptions) => {
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
      {{ listening ? "Listening..." : "map cc" }}
    </v-btn>

    <patch-module-options-input
      :disabled="listening"
      :options="props.options"
      @options-updated="onOptionsUpdated"
    ></patch-module-options-input>
  </div>
</template>
