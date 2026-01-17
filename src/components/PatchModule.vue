<script setup lang="ts">
import { computed, ref, type PropType, watch, onUnmounted } from "vue";
import AudioModule from "@/classes/audio-modules/AudioModule";
import {
  type ModuleInstance,
  type InputInstance,
  type OutputInstance,
} from "@/types/patchTypes";
import useDynamicSize from "@/composables/useDynamicSize";
import PatchModuleInput from "./PatchModuleInput.vue";
import {
  computeInputPosition,
  computeOutputPosition,
} from "@/helpers/patchHelper.ts";

const BORDER_SIZE = 1;
const emit = defineEmits([
  "begin-patching",
  "finish-patching",
  "inputs-updated",
  "outputs-updated",
]);

const props = defineProps({
  moduleInstance: {
    type: Object as PropType<ModuleInstance>,
    required: true,
  },
});

const { width: moduleDisplayWidth, height: moduleDisplayHeight } =
  useDynamicSize("module-container");

const moduleName = computed(() => {
  return props.moduleInstance.module.type;
});

const inputs = computed(() => {
  const newInputs = props.moduleInstance.module.inputs.map((input, index) => {
    return {
      name: input.name,
      moduleInput: input,
      position: computeInputPosition(
        props.moduleInstance,
        index,
        props.moduleInstance.module.inputs.length,
        moduleDisplayWidth.value,
        moduleDisplayHeight.value
      ),
    } as InputInstance;
  });

  emit("inputs-updated", newInputs);

  return newInputs;
});

const outputs = computed(() => {
  const newOutputs = props.moduleInstance.module.outputs.map((output, index) => {
    return {
      name: output.name,
      moduleOutput: output,
      position: computeOutputPosition(
        props.moduleInstance,
        index,
        props.moduleInstance.module.outputs.length,
        moduleDisplayWidth.value,
        moduleDisplayHeight.value
      ),
    } as OutputInstance;
  });

  emit("outputs-updated", newOutputs);

  return newOutputs;
});

const beginPatching = (outputInstance: OutputInstance) => {
  emit("begin-patching", {
    moduleInstance: props.moduleInstance,
    outputInstance,
  });
};

const finishPatching = (inputInstance: InputInstance) => {
  emit("finish-patching", {
    moduleInstance: props.moduleInstance,
    inputInstance,
  });
};

const moduleOptions = ref<{ name: string; value: any }[]>([]);

watch(
  () => props.moduleInstance.module,
  (newModule) => {
    if (!newModule) {
      moduleOptions.value = [];
      return;
    }

    moduleOptions.value = Object.entries(newModule.options).map(
      ([key, value]) => {
        return { name: key, value: value };
      }
    );
  },
  { immediate: true }
);

watch(
  () => moduleOptions.value,
  (newOptions) => {
    props.moduleInstance.module.updateOptions(
      newOptions.reduce((acc, option) => {
        acc[option.name] = option.value;
        return acc;
      }, {} as Record<string, any>)
    );
  },
  { deep: true }
);
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

    <div class="ma-2 d-inline-block">{{ moduleName }}</div>

    <input
      v-for="option in moduleOptions"
      :key="option.name"
      :name="option.name"
      type="text"
      v-model="option.value"
      @dblclick.stop=""
      class="module-option-input mr-2 d-inline-block"
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
  background-color: black;
  overflow: visible;
  border: 1px solid #fff;
}
.module-input-output {
  position: absolute;
  overflow: visible;
}
.module-option-input {
  field-sizing: content;
}
</style>
