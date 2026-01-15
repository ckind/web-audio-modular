<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import useDragging from "@/composables/useDragging";
import useMouseTracking from "@/composables/useMouseTracking";
import PatchModule from "@/components/PatchModule.vue";
import PatchConnection from "@/components/PatchConnection.vue";
import type {
  PatchGraph,
  PatchCableInstance,
  ModuleInstance,
  ConnectionInstance,
  InputInstance,
  OutputInstance,
} from "@/types/patchTypes";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import PatchContextMenu from "./PatchContextMenu.vue";
import {
  createAudioModule,
  type AudioModuleType,
} from "@/classes/factory/AudioModuleFactory";
import { logConnections, disconnect } from "@/helpers/patchHelper.ts";
import useAudioGlobalContext from "@/composables/useAudioGlobalContext.ts";

const { ctx } = useAudioGlobalContext();

defineProps({
  height: {
    type: Number,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
});

const patchGraph = ref<PatchGraph>({
  modules: [],
  connections: [],
});

let currentPatchingModule: ModuleInstance | null = null;
let currentPatchingOutput: OutputInstance | null = null;
let abortPatchingController: AbortController | null = null;
let abortPatchingSignal: AbortSignal | null = null;
// todo: multiple selected modules and connections
const selectedModule = ref<ModuleInstance | null>(null);
const selectedConnection = ref<ConnectionInstance | null>(null);
const inProgressConnection = ref<PatchCableInstance | null>(null);

const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const onGraphContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  contextMenuX.value = e.pageX;
  contextMenuY.value = e.pageY;
  showContextMenu.value = true;
};

const addModule = (moduleType: AudioModuleType) => {
  patchGraph.value.modules.push({
    module: createAudioModule(moduleType, crypto.randomUUID(), ctx.value!),
    position: {
      x: contextMenuX.value,
      y: contextMenuY.value,
    },
  });
  showContextMenu.value = false;
};

const deleteConnection = (connection: ConnectionInstance) => {
  // remove connection from graph
  // - cleanup is handled in onUnmounted of PatchConnection.vue
  // TODO: no it's not
  const index = patchGraph.value.connections.indexOf(connection);
  const removed = patchGraph.value.connections.splice(index, 1);
  disconnect(removed[0] as ConnectionInstance);

  console.log(
    "Deleting connection:",
    removed[0]?.from.moduleId,
    removed[0]?.to.moduleId
  );
};

const deleteModule = (moduleId: string) => {
  console.log("Deleting module id:", moduleId);

  // remove related connections from graph
  patchGraph.value.connections
    .filter((c) => c.from.moduleId === moduleId || c.to.moduleId === moduleId)
    .forEach((connection) => {
      disconnect(connection as ConnectionInstance);
    });

  patchGraph.value.connections = patchGraph.value.connections.filter(
    (c) => c.from.moduleId !== moduleId && c.to.moduleId !== moduleId
  );

  // remove module from graph
  const index = patchGraph.value.modules.findIndex(
    (m) => m.module.id === moduleId
  );
  const removed = patchGraph.value.modules.splice(index, 1);
  removed[0]?.module.dispose();
};

const onConnectionSelected = (connection: ConnectionInstance) => {
  clearSelection();

  selectedConnection.value = connection;
  connection.selected = true;
};

const onModuleSelected = (module: ModuleInstance) => {
  clearSelection();

  selectedModule.value = module;
  module.selected = true;
};

const clearSelection = () => {
  if (selectedModule.value) {
    selectedModule.value.selected = false;
    selectedModule.value = null;
  }
  if (selectedConnection.value) {
    selectedConnection.value.selected = false;
    selectedConnection.value = null;
  }
};

const isConnected = (
  moduleInstance: ModuleInstance,
  output: OutputInstance
): boolean => {
  return patchGraph.value.connections.some(
    (c) =>
      c.from.output.name === output.name &&
      c.from.moduleId === moduleInstance.module.id
  );
};

const onBeginPatching = (payload: {
  moduleInstance: ModuleInstance;
  outputInstance: OutputInstance;
}) => {
  console.log("Begin patching from output:", payload.outputInstance);

  if (isConnected(payload.moduleInstance, payload.outputInstance)) {
    // todo: allow multiple connections from the same output
    console.warn("Output is already connected.");
    return;
  }

  inProgressConnection.value = {
    from: {
      x: payload.outputInstance.position.x,
      y: payload.outputInstance.position.y,
    },
    to: {
      x: payload.outputInstance.position.x,
      y: payload.outputInstance.position.y,
    },
  };

  currentPatchingOutput = payload.outputInstance;
  currentPatchingModule = payload.moduleInstance;

  abortPatchingController = new AbortController();
  abortPatchingSignal = abortPatchingController.signal;

  document.addEventListener("click", cancelPatching, {
    once: true,
    signal: abortPatchingSignal,
  });

  startMouseTracking();
};

const cancelPatching = () => {
  console.log("Cancel patching");

  stopMouseTracking();

  currentPatchingOutput = null;
  inProgressConnection.value = null;
};

const onFinishPatching = (payload: {
  moduleInstance: ModuleInstance;
  inputInstance: InputInstance;
}) => {
  console.log("Finish patching to input:", payload.inputInstance);

  stopMouseTracking();

  if (currentPatchingOutput && currentPatchingModule) {
    patchGraph.value.connections.push({
      from: {
        moduleId: currentPatchingModule.module.id,
        output: currentPatchingOutput,
      },
      to: {
        moduleId: payload.moduleInstance.module.id,
        input: payload.inputInstance,
      },
    });

    currentPatchingOutput.moduleOutput.connect(
      payload.inputInstance.moduleInput
    );
    currentPatchingOutput = null;
    inProgressConnection.value = null;
  }

  if (abortPatchingController) {
    abortPatchingController.abort();
    abortPatchingController = null;
    abortPatchingSignal = null;
  }
};

const onPatchingMouseMove = (deltaX: number, deltaY: number) => {
  if (inProgressConnection.value) {
    inProgressConnection.value.to.x += deltaX;
    inProgressConnection.value.to.y += deltaY;
  }
};

const onModuleInputsUpdated = (moduleId: string, inputs: InputInstance[]) => {
  // update positions of connections related to this module
  patchGraph.value.connections.forEach((connection) => {
    if (connection.to.moduleId === moduleId) {
      const updatedInput = inputs.find(
        (input) => input.name === connection.to.input.name
      );
      if (updatedInput) {
        connection.to.input.position = { ...updatedInput.position };
      }
    }
  });
};

const onModuleOutputsUpdated = (
  moduleId: string,
  outputs: OutputInstance[]
) => {
  // update positions of connections related to this module
  patchGraph.value.connections.forEach((connection) => {
    if (connection.from.moduleId === moduleId) {
      const updatedOutput = outputs.find(
        (output) => output.name === connection.from.output.name
      );
      if (updatedOutput) {
        connection.from.output.position = { ...updatedOutput.position };
      }
    }
  });
};

const onModuleDrag = (
  deltaX: number,
  deltaY: number,
  moduleInstance: ModuleInstance
) => {
  moduleInstance.position.x += deltaX;
  moduleInstance.position.y += deltaY;

  // Update positions of connections related to this module
  patchGraph.value.connections.forEach((connection) => {
    if (connection.from.moduleId === moduleInstance.module.id) {
      connection.from.output.position.x += deltaX;
      connection.from.output.position.y += deltaY;
    }
    if (connection.to.moduleId === moduleInstance.module.id) {
      connection.to.input.position.x += deltaX;
      connection.to.input.position.y += deltaY;
    }
  });
};

const { onDragElementStart } = useDragging(onModuleDrag);

const { startMouseTracking, stopMouseTracking } =
  useMouseTracking(onPatchingMouseMove);

let abortKeyListenersController: AbortController | null = null;
let abortKeyListenersSignal: AbortSignal | null = null;

const assignKeyListners = () => {
  abortKeyListenersController = new AbortController();
  abortKeyListenersSignal = abortKeyListenersController.signal;

  document.addEventListener(
    "keydown",
    (e) => {
      switch (e.key) {
        case "Escape":
          if (inProgressConnection.value) {
            cancelPatching();
          }
          break;
        case "Backspace":
        case "Delete":
          if (selectedConnection.value) {
            deleteConnection(selectedConnection.value as ConnectionInstance);
            clearSelection();
          }
          if (selectedModule.value) {
            deleteModule(selectedModule.value.module.id);
            clearSelection();
          }
          break;
      }
    },
    { signal: abortKeyListenersSignal }
  );
};

const removeKeyListeners = () => {
  if (abortKeyListenersController) {
    abortKeyListenersController.abort();
    abortKeyListenersController = null;
    abortKeyListenersSignal = null;
  }
};

onMounted(() => {
  assignKeyListners();
});

onUnmounted(() => {
  removeKeyListeners();
});
</script>

<template>
  <v-card
    class="patch-window"
    variant="outlined"
    :ripple="false"
    :style="{ height: `${height}px`, width: `${width}px` }"
    @contextmenu.stop="onGraphContextMenu"
    @click="clearSelection"
  >
    <PatchModule
      v-for="instance in patchGraph.modules"
      :key="instance.module.id"
      :moduleInstance="(instance as ModuleInstance)"
      :class="['patch-module', { selected: instance.selected }]"
      :style="{
        left: instance.position.x + 'px',
        top: instance.position.y + 'px',
      }"
      :ripple="false"
      @mousedown="(e: MouseEvent) => onDragElementStart(e, instance)"
      @touchstart="(e: TouchEvent) => onDragElementStart(e, instance)"
      @begin-patching="onBeginPatching"
      @finish-patching="onFinishPatching"
      @inputs-updated="
        (inputs) => onModuleInputsUpdated(instance.module.id, inputs)
      "
      @outputs-updated="
        (outputs) => onModuleOutputsUpdated(instance.module.id, outputs)
      "
      @dblclick.stop="() => onModuleSelected(instance as ModuleInstance)"
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
      />

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
  </v-card>
</template>

<style scoped>
.patch-window {
  position: relative;
  cursor: default;
}
.patch-module {
  position: absolute;
  cursor: pointer;
}
.patch-module.selected {
  background-color: gray;
}
</style>
