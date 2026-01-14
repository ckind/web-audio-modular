<script setup lang="ts">
import { computed, onMounted, ref, type PropType } from "vue";
import AudioModule from "@/classes/AudioModule";
import useAudioGlobalContext from "@/composables/useAudioGlobalContext.ts";
import {
  createAudioModule,
  type AudioModuleType,
} from "@/classes/factory/AudioModuleFactory";
import ModuleOutput from "@/classes/ModuleOutput";
import type ModuleInput from "@/classes/ModuleInput";
import {
  type ModuleInstance,
  type InputInstance,
  type OutputInstance,
} from "./PatchWindow.vue";

const emit = defineEmits(["begin-patching", "finish-patching"]);

useAudioGlobalContext((ctx) => {
  audioModule.value = createAudioModule(props.moduleInstance.type, ctx);
});

const props = defineProps({
  moduleInstance: {
    type: Object as PropType<ModuleInstance>,
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
        text: key,
        value: {
          name: key,
          moduleInput: audioModule.value!.inputs.get(key) as ModuleInput,
          position: {
            x: props.moduleInstance.position.x,
            y: props.moduleInstance.position.y,
          },
        },
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
        text: key,
        value: {
          name: key,
          moduleOutput: audioModule.value!.outputs.get(key) as ModuleOutput,
          position: {
            x: props.moduleInstance.position.x,
            y: props.moduleInstance.position.y,
          },
        },
      };
    }) ?? []
  );
});

const beginPatching = (name: string, output: OutputInstance) => {
  if (!audioModule.value) {
    return;
  }

  emit("begin-patching", { moduleInstance: props.moduleInstance, output });
};

const finishPatching = (name: string, input: InputInstance) => {
  if (!audioModule.value) {
    return;
  }

  emit("finish-patching", { moduleInstance: props.moduleInstance, input });
};
</script>

<template>
  <v-card variant="outlined" class="audio-module user-select-none">
    <v-btn
      v-for="input in inputs"
      :key="input.text"
      @click.stop="finishPatching(input.text, input.value)"
      >{{ input.text }}</v-btn
    >
    <v-card-text>{{ moduleName }}</v-card-text>
    <v-btn
      v-for="output in outputs"
      :key="output.text"
      @click.stop="beginPatching(output.text, output.value)"
      >{{ output.text }}</v-btn
    >
  </v-card>
</template>

<style scoped>
.audio-module {
  display: inline-block;
  cursor: move;
  background-color: black;
}
</style>
