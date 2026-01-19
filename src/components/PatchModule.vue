<script setup lang="ts">
import { computed, ref, type PropType, watch } from "vue";
import {
  type ModuleInstance,
  type ConnectionInputInstance,
  type ConnectionOutputInstance,
} from "@/types/uIInstanceTypes";
import useDynamicSize from "@/composables/useDynamicSize";
import PatchModuleInput from "@/components/PatchModuleInput.vue";
import {
  computeInputPosition,
  computeOutputPosition,
} from "@/helpers/patchHelper.ts";
import useGUIComponents from "@/composables/useGUIComponents";
import PatchModuleOptionsInput from "./PatchModuleOptionsInput.vue";

const DEFAULT_MIN_WIDTH = 50;
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

const minWidth = computed(() => {
  return Math.max(DEFAULT_MIN_WIDTH, 30 * props.moduleInstance.outputs.length);
});

const { width: moduleDisplayWidth, height: moduleDisplayHeight } =
  useDynamicSize("module-container");

const moduleName = computed(() => {
  return props.moduleInstance.type;
});

const inputs = computed(() => {
  const newInputs = props.moduleInstance.inputs.map((i, index) => {
    return {
      name: i.name,
      type: i.type,
      position: computeInputPosition(
        props.moduleInstance,
        index,
        props.moduleInstance.inputs.length,
        moduleDisplayWidth.value,
        moduleDisplayHeight.value,
      ),
    } as ConnectionInputInstance;
  });

  emit("inputs-updated", newInputs);

  return newInputs;
});

const outputs = computed(() => {
  const newOutputs = props.moduleInstance.outputs.map((o, index) => {
    return {
      name: o.name,
      type: o.type,
      position: computeOutputPosition(
        props.moduleInstance,
        index,
        props.moduleInstance.outputs.length,
        moduleDisplayWidth.value,
        moduleDisplayHeight.value,
      ),
    } as ConnectionOutputInstance;
  });

  emit("outputs-updated", newOutputs);

  return newOutputs;
});

const beginPatching = (outputInstance: ConnectionOutputInstance) => {
  emit("begin-patching", outputInstance);
};

const finishPatching = (inputInstance: ConnectionInputInstance) => {
  emit("finish-patching", inputInstance);
};

watch(
  () => props.moduleInstance.options,
  (newOptions) => {
    emit("options-updated", newOptions);
  },
  { deep: true },
);

const onGuiOptionsUpdated = (options: Record<string, any>) => {
  emit("options-updated", options);
};
</script>

<template>
  <v-card
    ref="module-container"
    class="audio-module user-select-none"
    :style="{ minWidth: `${minWidth}px` }"
  >
    <v-tooltip
      :open-on-click="false"
      :open-on-focus="false"
      location="top"
      v-for="input in inputs"
      :text="input.name"
    >
      <template v-slot:activator="{ props }">
        <patch-module-input
          v-bind="props"
          :key="input.name"
          @mousedown.stop
          @touchstart.stop
          @click.stop="finishPatching(input)"
          :style="{
            left: `${input.position.x - moduleInstance.position.x - BORDER_SIZE}px`,
            top: `${input.position.y - moduleInstance.position.y - BORDER_SIZE}px`,
          }"
          :type="input.type"
          class="module-input-output"
        >
        </patch-module-input>
      </template>
    </v-tooltip>

    <div v-if="!moduleInstance.guiComponent">
      <div class="ma-2 d-inline-block">{{ moduleName }}</div>

      <!-- <input
        v-for="(value, key) in moduleInstance.options"
        :key="key"
        :name="key"
        type="text"
        v-model.lazy="moduleInstance.options[key]"
        @dblclick.stop=""
        class="module-option-input mr-2 d-inline-block"
      /> -->

      <patch-module-options-input
        v-model="moduleInstance.options"
      ></patch-module-options-input>
    </div>

    <component
      v-if="moduleInstance.guiComponent"
      class="ma-2"
      :is="guiComponents[moduleInstance.guiComponent]"
      :options="moduleInstance.options"
      @options-updated="onGuiOptionsUpdated"
    ></component>

    <v-tooltip
      :open-on-click="false"
      :open-on-focus="false"
      location="bottom"
      v-for="output in outputs"
      :text="output.name"
    >
      <template v-slot:activator="{ props }">
        <patch-module-output
          v-bind="props"
          :key="output.name"
          @mousedown.stop
          @touchstart.stop
          @click.stop="beginPatching(output)"
          :style="{
            left: `${
              output.position.x - moduleInstance.position.x - BORDER_SIZE
            }px`,
            top: `${output.position.y - moduleInstance.position.y - BORDER_SIZE}px`,
          }"
          :type="output.type"
          class="module-input-output"
        >
        </patch-module-output>
      </template>
    </v-tooltip>
  </v-card>
</template>

<style scoped>
.audio-module {
  display: inline-block;
  overflow: visible;
  border: 1px solid;
}
.module-input-output {
  position: absolute;
  overflow: visible;
}
</style>
