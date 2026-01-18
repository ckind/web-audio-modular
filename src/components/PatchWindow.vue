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
import PatchContextMenu from "@/components/PatchContextMenu.vue";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import { createAudioModule } from "@/classes/factory/AudioModuleFactory";
import useResizeObserver from "@/composables/useResizeObserver.ts";
import useToneAutoResume from "@/composables/useToneAutoResume";
import Patcher from "@/classes/Patcher";
import * as Tone from "tone";

function test() {
  // const ctx = new AudioContext();
  // const osc = ctx.createOscillator();
  // osc.frequency.value = 220;
  // osc.start();
  // const src = ctx.createConstantSource();
  // src.offset.value = 220;
  // src.start();
  // src.connect(osc.frequency);
  // window.setTimeout(() => {
  //   src.disconnect(osc.frequency);
  //   console.log("Source disconnected from oscillator frequency");
  // }, 2000);
  // window.setTimeout(() => {
  //   osc.stop();
  //   console.log("Oscillator stopped");
  // }, 4000);
  // osc.connect(ctx.destination);
  ///////////////////////////////////
  // const osc = new Tone.Oscillator(220).start();
  // const src1 = new Tone.Signal(220);
  // const src2 = new Tone.Signal(220);
  // src1.connect(osc.frequency);
  // src2.connect(src1);
  // console.log(osc.frequency.value);
  // osc.toDestination();
  // window.setTimeout(() => {
  //   src1.disconnect(osc.frequency);
  //   src2.disconnect(src1);
  // }, 2000);
  // window.setTimeout(() => {
  //   osc.stop();
  //   console.log("Oscillator stopped");
  // }, 4000);
}

useToneAutoResume(test);

let patchWindowPageX = 0;
let patchWindowPageY = 0;

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

// pather is used to manage internal audio modules and connections
const patcher = new Patcher();
// patchGraph is used to manage the state of the UI representation of the patch
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

const savePatch = () => {
  const patchData = JSON.stringify(patchGraph.value);
  const blob = new Blob([patchData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "patch.json";
  a.click();

  URL.revokeObjectURL(url);
};

const onGraphContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  contextMenuX.value = e.pageX;
  contextMenuY.value = e.pageY;
  showContextMenu.value = true;
};

const addModule = (moduleType: AudioModuleType, guiComponent?: string) => {
  const module = createAudioModule(moduleType, crypto.randomUUID());
  const moduleInstance = {
    moduleId: module.id,
    displayName: module.type,
    guiComponent: guiComponent,
    options: module.options,
    outputNames: module.outputs.map((o) => o.name),
    inputNames: module.inputs.map((i) => i.name),
    position: {
      x: contextMenuX.value - patchWindowPageX,
      y: contextMenuY.value - patchWindowPageY,
    },
  };

  patcher.addModule(module);
  patchGraph.value.modules.push(moduleInstance);

  module.updateUIInstanceOptions = (data: any) => {
    const i = patchGraph.value.modules.find(m => m.moduleId == module.id);
    i!.options = { ...moduleInstance.options, ...data };
  };

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
  console.log("Deleting module id:", moduleId);

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
  output: OutputInstance,
): boolean => {
  return patchGraph.value.connections.some(
    (c) =>
      c.from.output.name === output.name &&
      c.from.moduleId === moduleInstance.moduleId,
  );
};

const onBeginPatching = (
  moduleInstance: ModuleInstance,
  outputInstance: OutputInstance,
) => {
  console.log("Begin patching from output:", outputInstance);
  if (isConnected(moduleInstance, outputInstance)) {
    // todo: allow multiple connections from the same output
    console.warn("Output is already connected.");
    return;
  }

  inProgressConnection.value = {
    from: {
      x: outputInstance.position.x,
      y: outputInstance.position.y,
    },
    to: {
      x: outputInstance.position.x,
      y: outputInstance.position.y,
    },
  };

  currentPatchingOutput = outputInstance;
  currentPatchingModule = moduleInstance;

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

const onFinishPatching = (
  moduleInstance: ModuleInstance,
  inputInstance: InputInstance,
) => {
  console.log("Finish patching to input:", inputInstance);

  stopMouseTracking();

  if (currentPatchingOutput && currentPatchingModule) {
    patchGraph.value.connections.push({
      from: {
        moduleId: currentPatchingModule.moduleId,
        output: currentPatchingOutput,
      },
      to: {
        moduleId: moduleInstance.moduleId,
        input: inputInstance,
      },
    });

    patcher.connect(
      {
        moduleId: currentPatchingModule.moduleId,
        outputName: currentPatchingOutput.name,
      },
      {
        moduleId: moduleInstance.moduleId,
        inputName: inputInstance.name,
      },
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
  outputs: OutputInstance[],
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
  options: Record<string, any>,
) => {
  const module = patcher.getModule(moduleId);
  module.updateOptions(options);
};

const onModuleDrag = (
  deltaX: number,
  deltaY: number,
  moduleInstance: ModuleInstance,
) => {
  moduleInstance.position.x += deltaX;
  moduleInstance.position.y += deltaY;

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

const { onDragElementStart } = useDragging(onModuleDrag);
const { startMouseTracking, stopMouseTracking } =
  useMouseTracking(onPatchingMouseMove);

useResizeObserver("patch-window", (entries) => {
  patchWindowPageX =
    entries[0]!.target.getBoundingClientRect().x + window.scrollX;
  patchWindowPageY =
    entries[0]!.target.getBoundingClientRect().y + window.scrollY;
});

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
            deleteModule(selectedModule.value.moduleId);
            clearSelection();
          }
          break;
      }
    },
    { signal: abortKeyListenersSignal },
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
  <v-btn @click="savePatch">Save Patch</v-btn>
  <div
    ref="patch-window"
    class="patch-window"
    @contextmenu.stop="onGraphContextMenu"
    @click="clearSelection"
  >
    <!-- prettier-ignore -->
    <PatchModule
      v-for="module in patchGraph.modules"
      :key="module.moduleId"
      :moduleInstance="(module as ModuleInstance)"
      :class="['patch-module', { selected: module.selected }]"
      :style="{
        left: module.position.x + 'px',
        top: module.position.y + 'px',
      }"
      :ripple="false"
      @mousedown="(e: MouseEvent) => onDragElementStart(e, module)"
      @touchstart="(e: TouchEvent) => onDragElementStart(e, module)"
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
  border: 1px solid white;
  border-radius: 5px;
  overflow: auto;
}
.patch-module {
  position: absolute;
  cursor: pointer;
}
.patch-module.selected {
  background-color: gray;
}
</style>
