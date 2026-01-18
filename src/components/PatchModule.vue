<script setup lang="ts">
import { computed, ref, type PropType, watch } from "vue";
import {
  type ModuleInstance,
  type InputInstance,
  type OutputInstance,
} from "@/types/patchTypes";
import useDynamicSize from "@/composables/useDynamicSize";
import PatchModuleInput from "@/components/PatchModuleInput.vue";
import {
  computeInputPosition,
  computeOutputPosition,
} from "@/helpers/patchHelper.ts";
import useGUIComponents from "@/composables/useGUIComponents";

const guiComponents = useGUIComponents();

const BORDER_SIZE = 1;
const emit = defineEmits([
  "begin-patching",
  "finish-patching",
  "inputs-updated",
  "outputs-updated",
  "options-updated",
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
  return props.moduleInstance.displayName;
});

const inputs = computed(() => {
  const newInputs = props.moduleInstance.inputNames.map((inputName, index) => {
    return {
      name: inputName,
      position: computeInputPosition(
        props.moduleInstance,
        index,
        props.moduleInstance.inputNames.length,
        moduleDisplayWidth.value,
        moduleDisplayHeight.value,
      ),
    } as InputInstance;
  });

  emit("inputs-updated", newInputs);

  return newInputs;
});

const outputs = computed(() => {
  const newOutputs = props.moduleInstance.outputNames.map(
    (outputName, index) => {
      return {
        name: outputName,
        position: computeOutputPosition(
          props.moduleInstance,
          index,
          props.moduleInstance.outputNames.length,
          moduleDisplayWidth.value,
          moduleDisplayHeight.value,
        ),
      } as OutputInstance;
    },
  );

  emit("outputs-updated", newOutputs);

  return newOutputs;
});

const beginPatching = (outputInstance: OutputInstance) => {
  emit("begin-patching", outputInstance);
};

const finishPatching = (inputInstance: InputInstance) => {
  emit("finish-patching", inputInstance);
};

const moduleOptions = ref<{ name: string; value: string }[]>([]);

watch(
  () => props.moduleInstance.options,
  (newOptions) => {
    moduleOptions.value = Object.entries(newOptions).map(([name, value]) => ({
      name,
      value: String(value),
    }));
  },
  { immediate: true },
);

watch(
  () => moduleOptions.value,
  (newOptions) => {
    emit(
      "options-updated",
      newOptions.reduce(
        (acc, option) => {
          acc[option.name] = option.value;
          return acc;
        },
        {} as Record<string, any>,
      ),
    );
  },
  { deep: true },
);

const onGuiOptionsUpdated = (options: Record<string, any>) => {
  emit("options-updated", options);
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

    <div v-if="!moduleInstance.guiComponent">
      <div class="ma-2 d-inline-block">{{ moduleName }}</div>

      <input
        v-for="option in moduleOptions"
        :key="option.name"
        :name="option.name"
        type="text"
        v-model.lazy="option.value"
        @dblclick.stop=""
        class="module-option-input mr-2 d-inline-block"
      />
    </div>

    <component
      v-if="moduleInstance.guiComponent"
      class="ma-2"
      :is="guiComponents[moduleInstance.guiComponent]"
      :options="moduleInstance.options"
      @options-updated="onGuiOptionsUpdated"
    ></component>

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
