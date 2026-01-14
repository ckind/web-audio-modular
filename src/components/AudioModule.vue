<script setup lang="ts">
import { computed, onMounted, ref, type PropType } from "vue";
import AudioModule from "@/classes/AudioModule";
import useAudioGlobalContext from "@/composables/useAudioGlobalContext.ts";
import {
  createAudioModule,
  type AudioModuleType,
} from "@/classes/factory/AudioModuleFactory";
import { usePatcherStore } from "@/store/patcher";
import ModuleOutput from "@/classes/ModuleOutput";
import type ModuleInput from "@/classes/ModuleInput";

const patcherStore = usePatcherStore();

useAudioGlobalContext((ctx) => {
  audioModule.value = createAudioModule(props.moduleType, ctx);
});

const props = defineProps({
  moduleType: {
    type: String as PropType<AudioModuleType>,
    required: true,
  },
});

const audioModule = ref<AudioModule | null>(null);

const moduleName = computed(() => {
  return audioModule.value?.type ?? "";
});

const inputs = computed(() => {
  if (!audioModule.value) {
    return [];
  }

  return (
    Array.from(audioModule.value.inputs.keys()).map((key: string) => {
      return {
        name: key,
        value: audioModule.value!.inputs.get(key) as ModuleInput,
      };
    }) ?? []
  );
});

const outputs = computed(() => {
  if (!audioModule.value) {
    return [];
  }

  return (
    Array.from(audioModule.value.outputs.keys()).map((key: string) => {
      return {
        name: key,
        value: audioModule.value!.outputs.get(key) as ModuleOutput,
      };
    }) ?? []
  );
});

const beginPatching = (name: string, output: ModuleOutput) => {
  console.log("Begin patching from output:", name);
  patcherStore.setCurrentPatcherOutput(output);
  document.addEventListener(
    "click",
    () => {
      patcherStore.setCurrentPatcherOutput(null);
    },
    { once: true }
  );
};

const finishPatching = (name: string, input: ModuleInput) => {
  const currentOutput = patcherStore.currentPatcherOutput;
  if (currentOutput) {
    console.log(`Connecting output ${currentOutput} to input ${name}`);
    currentOutput.connect(input);
    patcherStore.setCurrentPatcherOutput(null);
  }
};
</script>

<template>
  <v-card variant="outlined">
    <v-btn
      v-for="input in inputs"
      :key="input.name"
      @click.stop="finishPatching(input.name, input.value)"
      >{{ input.name }}</v-btn
    >
    <v-card-text>{{ moduleName }}</v-card-text>
    <v-btn
      v-for="output in outputs"
      :key="output.name"
      @click.stop="beginPatching(output.name, output.value)"
      >{{ output.name }}</v-btn
    >
  </v-card>
</template>
