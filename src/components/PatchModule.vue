<script setup lang="ts">
import { computed, ref, type PropType, watch } from "vue";
import AudioModule from "@/classes/audio-modules/AudioModule";
import useAudioGlobalContext from "@/composables/useAudioGlobalContext.ts";
import { createAudioModule } from "@/classes/factory/AudioModuleFactory";
import {
  type ModuleInstance,
  type InputInstance,
  type OutputInstance,
} from "@/types/patchWindowTypes";
import useDynamicSize from "@/composables/useDynamicSize";
import PatchModuleInput from "./PatchModuleInput.vue";

const BORDER_SIZE = 1;
const emit = defineEmits(["begin-patching", "finish-patching"]);

useAudioGlobalContext((ctx) => {
  audioModule.value = createAudioModule(
    props.moduleInstance.type,
    props.moduleInstance.id,
    ctx
  );
});

const props = defineProps({
  moduleInstance: {
    type: Object as PropType<ModuleInstance>,
    required: true,
  },
});

const audioModule = ref<AudioModule<any> | null>(null);

const { width: moduleDisplayWidth, height: moduleDisplayHeight } =
  useDynamicSize("module-container");

const moduleName = computed(() => {
  return audioModule.value?.type ?? "";
});

const inputs = computed(() => {
  if (!audioModule.value) {
    return [];
  }

  return audioModule.value.inputs.map((input) => {
    return {
      name: input.name,
      moduleInput: input,
      position: {
        // todo: evenly space
        x: props.moduleInstance.position.x + moduleDisplayWidth.value / 2,
        y: props.moduleInstance.position.y,
      },
    } as InputInstance;
  });
});

const outputs = computed(() => {
  if (!audioModule.value) {
    return [];
  }

  return audioModule.value.outputs.map((output) => {
    return {
      name: output.name,
      moduleOutput: output,
      position: {
        // todo: evenly space
        x: props.moduleInstance.position.x + moduleDisplayWidth.value / 2,
        y: props.moduleInstance.position.y + moduleDisplayHeight.value,
      },
    } as OutputInstance;
  });
});

const beginPatching = (outputInstance: OutputInstance) => {
  if (!audioModule.value) {
    return;
  }

  emit("begin-patching", {
    moduleInstance: props.moduleInstance,
    outputInstance,
  });
};

const finishPatching = (inputInstance: InputInstance) => {
  if (!audioModule.value) {
    return;
  }

  emit("finish-patching", {
    moduleInstance: props.moduleInstance,
    inputInstance,
  });
};
</script>

<template>
  <v-card ref="module-container" class="audio-module user-select-none">
    <patch-module-input
      v-for="input in inputs"
      :key="input.name"
      @click.stop="finishPatching(input)"
      :style="{
        left: `${input.position.x - moduleInstance.position.x - BORDER_SIZE}px`,
        top: `${input.position.y - moduleInstance.position.y - BORDER_SIZE}px`,
      }"
      class="module-input-output"
    >
    </patch-module-input>

    <div class="pa-2 d-inline-block">{{ moduleName }}</div>

    <input
      v-for="(value, key) in audioModule?.options"
      :key="key"
      :name="value.name"
      type="text"
    />

    <patch-module-output
      v-for="output in outputs"
      :key="output.name"
      @click.stop="beginPatching(output)"
      :style="{
        left: `${
          output.position.x - moduleInstance.position.x - BORDER_SIZE
        }px`,
        top: `${output.position.y - moduleInstance.position.y - BORDER_SIZE}px`,
      }"
      class="module-input-output"
    >
    </patch-module-output>
  </v-card>
</template>

<style scoped>
.audio-module {
  display: inline-block;
  cursor: move;
  background-color: black;
  overflow: visible;
  border: 1px solid #fff;
}
.module-input-output {
  position: absolute;
  overflow: visible;
}
</style>
