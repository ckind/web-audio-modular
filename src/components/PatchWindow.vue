<script lang="ts" setup>
import { onMounted, onUnmounted, ref, computed, toRaw } from "vue";
import useDragging from "@/composables/useDragging";
import PatchModule from "@/components/PatchModule.vue";
import PatchConnection from "@/components/PatchConnection.vue";
import type {
  PatchGraph,
  ModuleInstance,
  ConnectionInstance,
  ConnectionInputInstance,
  ConnectionOutputInstance,
  Position,
} from "@/types/uIInstanceTypes";
import PatchContextMenu from "@/components/PatchContextMenu.vue";
import PatchToolbar from "@/components/PatchToolbar.vue";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import { createAudioModule } from "@/moduleFactory";
import useResizeObserver from "@/composables/useResizeObserver.ts";
import usePatchShortcuts from "@/composables/usePatchShortcuts";
import usePatchPersistence from "@/composables/usePatchPersistence";
import usePatching from "@/composables/usePatching";
import usePatchSelection from "@/composables/usePatchSelection";
import Patcher from "@/classes/Patcher";
import { useAppColors } from "@/store/appColors";
import { usePatchConsole } from "@/store/patchConsole";
//

const appColors = useAppColors();
const patchConsole = usePatchConsole();
const patchWindowStyle = computed(() => {
  return {};
});

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
};

let patchWindowPageX = 0;
let patchWindowPageY = 0;

const props = defineProps({
  height: {
    type: Number,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
});

// INFO: The patcher class is used to manage internal audio modules and connections while
// the patchGraph is a serializable model representing the state of the UI instances.
// Data-flow is typically one-way from patchGraph (UI) to patcher (audio graph).
// This is implemented by calling the updateOptions method on the IAudioModule.
// Their are exceptions for some GUI modules which need to be updated based on audio node
// changes. The optional updateUIState is provided for this purpose.

const patcher = new Patcher();
const patchGraph = ref<PatchGraph>({
  version: import.meta.env.PACKAGE_VERSION,
  modules: [],
  connections: [],
});

const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const getModuleInstance = (moduleId: string) => {
  return patchGraph.value.modules.find((m) => m.moduleId === moduleId);
};

const clearPatch = () => {
  patchGraph.value = {
    version: import.meta.env.PACKAGE_VERSION,
    modules: [],
    connections: [],
  };
  patcher.clear();
};

const onGraphContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  contextMenuX.value = e.pageX;
  contextMenuY.value = e.pageY;
  showContextMenu.value = true;
};

const addModule = (moduleType: AudioModuleType, guiComponent?: string) => {
  // create module with default options
  const module = createAudioModule(moduleType, crypto.randomUUID());
  const moduleInstance = {
    moduleId: module.id,
    type: module.type,
    guiComponent: guiComponent,
    guiState: {},
    options: deepCloneModuleOptions(module.options),
    outputs: module.outputs.map((o) => {
      return { name: o.name, type: o.type };
    }),
    inputs: module.inputs.map((i) => {
      return { name: i.name, type: i.type };
    }),
    position: {
      x: contextMenuX.value - patchWindowPageX,
      y: contextMenuY.value - patchWindowPageY,
    },
  };

  patcher.addModule(module);
  patchGraph.value.modules.push(moduleInstance);

  module.updateUIState = (options: any, guiState?: any) => {
    // need to re-query the graph to reference to exact ui instance 
    const instance = patchGraph.value.modules.find(
      (m) => m.moduleId === moduleInstance.moduleId,
    );

    if (!instance) return;

    if (options) {
      instance.options = { ...instance.options, ...options };
    }

    if (guiState) {
      instance.guiState = { ...instance.guiState, ...guiState };
    }
  };

  updateModulePositionStyle(moduleInstance.moduleId, moduleInstance.position);

  showContextMenu.value = false;
};

const deleteConnection = (connection: ConnectionInstance) => {
  const index = patchGraph.value.connections.indexOf(connection);
  const removed = patchGraph.value.connections.splice(index, 1);

  patcher.disconnect(
    {
      moduleId: removed[0]!.from.moduleId,
      outputName: removed[0]!.from.output.name,
    },
    {
      moduleId: removed[0]!.to.moduleId,
      inputName: removed[0]!.to.input.name,
    },
  );

  console.log(
    "Deleting connection:",
    removed[0]?.from.moduleId,
    removed[0]?.to.moduleId,
  );
};

const deleteModule = (moduleId: string) => {
  // remove related connections from graph
  patchGraph.value.connections = patchGraph.value.connections.filter(
    (c) => c.from.moduleId !== moduleId && c.to.moduleId !== moduleId,
  );
  // remove module from graph
  patchGraph.value.modules = patchGraph.value.modules.filter(
    (m) => m.moduleId !== moduleId,
  );

  // handle audio disconnection and cleanup in patcher
  patcher.deleteModule(moduleId);
};

const duplicateModule = (moduleInstance: ModuleInstance) => {
  const oldEl = document.getElementById(moduleInstance.moduleId);
  const width = oldEl!.getBoundingClientRect().width;

  const newId = crypto.randomUUID();
  const newInstance = structuredClone(toRaw(moduleInstance));

  newInstance.moduleId = newId;
  newInstance.position.x = moduleInstance.position.x + width + 10;
  newInstance.position.y = moduleInstance.position.y;

  const newModule = createAudioModule(
    newInstance.type as AudioModuleType,
    newInstance.moduleId,
    newInstance.options,
  );

  patcher.addModule(newModule);
  patchGraph.value.modules.push(newInstance);

  updateModulePositionStyle(newId, newInstance.position);

  moduleInstance.selected = false;
  selectedModule.value = newInstance;
};

const onModuleInputsUpdated = (
  moduleId: string,
  inputs: ConnectionInputInstance[],
) => {
  // update positions of connections related to this module
  patchGraph.value.connections.forEach((connection) => {
    if (connection.to.moduleId === moduleId) {
      const updatedInput = inputs.find(
        (input) => input.name === connection.to.input.name,
      );
      if (updatedInput) {
        connection.to.input.position = { ...updatedInput.position };
      }
    }
  });
};

const onModuleOutputsUpdated = (
  moduleId: string,
  outputs: ConnectionOutputInstance[],
) => {
  // update positions of connections related to this module
  patchGraph.value.connections.forEach((connection) => {
    if (connection.from.moduleId === moduleId) {
      const updatedOutput = outputs.find(
        (output) => output.name === connection.from.output.name,
      );
      if (updatedOutput) {
        connection.from.output.position = { ...updatedOutput.position };
      }
    }
  });
};

const onModuleOptionsUpdated = (
  moduleId: string,
  newOptions: Record<string, any>,
) => {
  const moduleInstance = getModuleInstance(moduleId);

  if (moduleInstance) {
    moduleInstance.options = { ...moduleInstance.options, ...newOptions };
  }

  const module = patcher.getModule(moduleId);
  module.updateOptions(newOptions);
};

const updateModulePositionStyle = (moduleId: string, position: Position) => {
  window.requestAnimationFrame(() => {
    const moduleEl = getElement(moduleId);
    if (moduleEl) {
      moduleEl.style.left = `${position.x}px`;
      moduleEl.style.top = `${position.y}px`;
    }
  });
};

const onModuleDrag = (
  deltaX: number,
  deltaY: number,
  moduleInstance: ModuleInstance,
) => {
  moduleInstance.position.x += deltaX;
  moduleInstance.position.y += deltaY;

  updateModulePositionStyle(moduleInstance.moduleId, moduleInstance.position);

  // Update positions of connections related to this module
  patchGraph.value.connections.forEach((connection) => {
    if (connection.from.moduleId === moduleInstance.moduleId) {
      connection.from.output.position.x += deltaX;
      connection.from.output.position.y += deltaY;
    }
    if (connection.to.moduleId === moduleInstance.moduleId) {
      connection.to.input.position.x += deltaX;
      connection.to.input.position.y += deltaY;
    }
  });
};

const onModuleDragEnd = () => {
  document.documentElement.classList.remove("disable-tooltips");
};

const onModuleDragStart = (
  e: MouseEvent | TouchEvent,
  moduleInstance: ModuleInstance,
) => {
  document.documentElement.classList.add("disable-tooltips");
  onDragElementStart(e, moduleInstance);
};

const { onDragElementStart } = useDragging(onModuleDrag, onModuleDragEnd);

useResizeObserver("patch-window", (entries) => {
  patchWindowPageX =
    entries[0]!.target.getBoundingClientRect().x + window.scrollX;
  patchWindowPageY =
    entries[0]!.target.getBoundingClientRect().y + window.scrollY;
});

const {
  savePatch,
  loadPatch,
  deepCloneModuleOptions,
} = usePatchPersistence({
  patchGraph,
  patcher,
  updateModulePositionStyle,
  onBeforeReconstruct: () => {
    elementCache.clear();
  },
  onBeforeLoad: () => {
    clearPatch();
  },
});

const {
  inProgressConnection,
  onBeginPatching,
  onFinishPatching,
  cancelPatching,
} = usePatching({
  patchGraph,
  patcher,
});

const {
  selectedModule,
  selectedConnection,
  clearSelection,
  onConnectionSelected,
  onModuleSelected,
} = usePatchSelection();

const { assignKeyListeners, removeKeyListeners } = usePatchShortcuts({
  selectedModule,
  selectedConnection,
  inProgressConnection,
  cancelPatching,
  deleteConnection,
  deleteModule,
  duplicateModule,
  clearSelection,
});

onMounted(() => {
  assignKeyListeners();
});

onUnmounted(() => {
  removeKeyListeners();
  patcher.clear();
});
</script>

<template>
  <PatchToolbar
    :width="width"
    :border-color="appColors.textColor"
    @save="savePatch"
    @load="loadPatch"
    @clear="clearPatch"
  />

  <div
    ref="patch-window"
    class="patch-window"
    @contextmenu.stop="onGraphContextMenu"
    @click="clearSelection"
    :style="patchWindowStyle"
  >
    <!-- prettier-ignore -->
    <PatchModule
      v-for="module in patchGraph.modules"
      :id="module.moduleId"
      :key="module.moduleId"
      :moduleInstance="(module as ModuleInstance)"
      :class="['patch-module', { selected: module.selected }]"
      :style="{
        borderColor: appColors.textColor,
        backgroundColor: appColors.backgroundColor,
      }"
      :ripple="false"
      @mousedown="(e: MouseEvent) => onModuleDragStart(e, module)"
      @touchstart="(e: TouchEvent) => onModuleDragStart(e, module)"
      @begin-patching="(output) => onBeginPatching(module, output)"
      @finish-patching="(input) => onFinishPatching(module, input)"
      @inputs-updated="(inputs) => onModuleInputsUpdated(module.moduleId, inputs)"
      @outputs-updated="(outputs) => onModuleOutputsUpdated(module.moduleId, outputs)"
      @dblclick.stop="() => onModuleSelected(module as ModuleInstance)"
      @options-updated="(options) => onModuleOptionsUpdated(module.moduleId, options)"
    ></PatchModule>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="`0 0 ${width} ${height}`"
      :width="width"
      :height="height"
    >
      <PatchCable
        v-if="inProgressConnection != null"
        :startPosition="inProgressConnection.from"
        :endPosition="inProgressConnection.to"
        :connectionType="inProgressConnection.connectionType"
      />

      <!-- prettier-ignore -->
      <PatchConnection
        v-for="(connection, i) in patchGraph.connections"
        :key="i"
        :connection="(connection as ConnectionInstance)"
        @selected="() => onConnectionSelected(connection as ConnectionInstance)"
      />
    </svg>

    <PatchContextMenu
      v-model="showContextMenu"
      :x="contextMenuX"
      :y="contextMenuY"
      @add-module="addModule"
    />
  </div>
</template>

<style scoped>
.patch-window {
  position: relative;
  cursor: default;
  border: 1px solid;
  border-radius: 5px;
}
.patch-module {
  position: absolute;
  cursor: pointer;
}
.patch-module.selected {
  box-shadow: 0 0 5px 2px;
}
.button-container {
  width: 100%;
}
</style>

<style>
/* Disable all Vuetify tooltips */
.disable-tooltips .v-tooltip {
  display: none !important;
  pointer-events: none !important;
}
</style>
