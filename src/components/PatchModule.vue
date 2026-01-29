<script setup lang="ts">
import { computed, type PropType, watch } from "vue";
import {
  type ModuleInstance,
  type ConnectionInputInstance,
  type ConnectionOutputInstance,
  type ModuleInputInstance,
  type ModuleOutputInstance,
} from "@/types/uIInstanceTypes";
import useDynamicSize from "@/composables/useDynamicSize";
import PatchModuleInput from "@/components/PatchModuleInput.vue";
import useGUIComponents from "@/composables/useGUIComponents";
import PatchModuleOptionsInput from "./PatchModuleOptionsInput.vue";

const DEFAULT_MIN_WIDTH = 30;
const guiComponents = useGUIComponents();

const elementCache = new Map<string, HTMLElement>();
const getElement = (id: string): HTMLElement | null => {
  if (elementCache.has(id)) {
    return elementCache.get(id)!;
  }
  const element = document.getElementById(id);
  if (element) {
    elementCache.set(id, element);
  }
  return element;
}

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

const computeInputPosition = (inputIndex: number, totalInputs: number) => {
  const widthMult = moduleDisplayWidth.value / totalInputs;
  return {
    x: props.moduleInstance.position.x + widthMult * (inputIndex + 0.5),
    y: props.moduleInstance.position.y,
  };
};

const computeOutputPosition = (outputIndex: number, totalOutputs: number) => {
  const widthMult = moduleDisplayWidth.value / totalOutputs;
  return {
    x: props.moduleInstance.position.x + widthMult * (outputIndex + 0.5),
    y: props.moduleInstance.position.y + moduleDisplayHeight.value,
  };
};

const minWidth = computed(() => {
  return Math.max(DEFAULT_MIN_WIDTH, 30 * props.moduleInstance.outputs.length);
});

const { width: moduleDisplayWidth, height: moduleDisplayHeight } =
  useDynamicSize("module-container");

const moduleName = computed(() => {
  return props.moduleInstance.type;
});

const updateModuleInputPositionStyles = (inputs: ModuleInputInstance[]) => {
  window.requestAnimationFrame(() => {
    for (let i = 0; i < inputs.length; i++) {
      const position = computeInputPosition(i, inputs.length);
      const inputElement = getElement(
        `${props.moduleInstance.moduleId}-input-${inputs[i]!.name}`,
      );
      if (inputElement) {
        inputElement.style.left = `${position.x - props.moduleInstance.position.x - BORDER_SIZE}px`;
        inputElement.style.top = `${position.y - props.moduleInstance.position.y}px`;
      }
    }
  });
};

const updateModuleOutputPositionStyles = (outputs: ModuleOutputInstance[]) => {
  window.requestAnimationFrame(() => {
    for (let i = 0; i < outputs.length; i++) {
      const position = computeOutputPosition(i, outputs.length);
      const outputElement = getElement(
        `${props.moduleInstance.moduleId}-output-${outputs[i]!.name}`,
      );
      if (outputElement) {
        outputElement.style.left = `${position.x - props.moduleInstance.position.x - BORDER_SIZE}px`;
        outputElement.style.top = `${position.y - props.moduleInstance.position.y - BORDER_SIZE}px`;
      }
    }
  });
};

watch(
  () => [
    props.moduleInstance.position,
    moduleDisplayWidth.value,
    moduleDisplayHeight.value,
  ],
  () => {
    updateModuleInputPositionStyles(props.moduleInstance.inputs);
    updateModuleOutputPositionStyles(props.moduleInstance.outputs);
  },
  { immediate: true, deep: true },
);

const inputs = computed(() => {
  const newInputs = props.moduleInstance.inputs.map((i, index) => {
    return {
      name: i.name,
      type: i.type,
      position: computeInputPosition(index, props.moduleInstance.inputs.length),
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
        index,
        props.moduleInstance.outputs.length,
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
          :id="`${moduleInstance.moduleId}-input-${input.name}`"
          :key="input.name"
          @mousedown.stop
          @touchstart.stop
          @click.stop="finishPatching(input)"
          :type="input.type"
          class="module-input-output"
        >
        </patch-module-input>
      </template>
    </v-tooltip>

    <div v-if="!moduleInstance.guiComponent">
      <div class="ma-2 d-inline-block">{{ moduleName }}</div>

      <patch-module-options-input
        :options="moduleInstance.options"
        @options-updated="onGuiOptionsUpdated"
      ></patch-module-options-input>
    </div>

    <component
      v-if="moduleInstance.guiComponent"
      class="ma-2"
      :is="guiComponents[moduleInstance.guiComponent]"
      :guiState="moduleInstance.guiState"
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
          :id="`${moduleInstance.moduleId}-output-${output.name}`"
          @mousedown.stop
          @touchstart.stop
          @click.stop="beginPatching(output)"
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
  white-space: nowrap;
}
.module-input-output {
  position: absolute;
  overflow: visible;
}
</style>
