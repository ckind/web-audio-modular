<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import useDragging from "@/composables/useDragging";
import useMouseTracking from "@/composables/useMouseTracking";
import PatchModule from "@/components/PatchModule.vue";
import PatchConnection from "@/components/PatchConnection.vue";
import type {
  PatchGraph,
  ModuleInstance,
  ConnectionInstance,
  InputInstance,
  OutputInstance,
} from "@/types/patchWindowTypes";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";

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
  modules: [
    {
      id: "1",
      type: "oscillator",
      position: {
        x: 100,
        y: 100,
      },
    },
    {
      id: "2",
      type: "speaker-output",
      position: {
        x: 100,
        y: 200,
      },
    },
  ],
  connections: [],
});

let currentPatchingModule: ModuleInstance | null = null;
let currentPatchingOutput: OutputInstance | null = null;
let abortPatchingController: AbortController | null = null;
let abortPatchingSignal: AbortSignal | null = null;
// todo: multiple selected modules and connections
const selectedModule = ref<ModuleInstance | null>(null);
const selectedConnection = ref<ConnectionInstance | null>(null);
const inProgressConnection = ref<ConnectionInstance | null>(null);

const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const onGraphContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  contextMenuX.value = e.pageX;
  contextMenuY.value = e.pageY;
  showContextMenu.value = true;
};

const addModule = () => {
  showContextMenu.value = false;
};

const onConnectionSelected = (connection: ConnectionInstance) => {
  if (selectedConnection.value) {
    selectedConnection.value.selected = false;
  }

  selectedConnection.value = connection;
  connection.selected = true;
};

const isConnected = (
  module: ModuleInstance,
  output: OutputInstance
): boolean => {
  return patchGraph.value.connections.some(
    (c) => c.from.output.name === output.name && c.from.moduleId === module.id
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
      moduleId: payload.moduleInstance.id,
      output: payload.outputInstance,
    },
    to: {
      moduleId: "",
      input: {
        position: {
          x: payload.outputInstance.position.x,
          y: payload.outputInstance.position.y,
        },
        name: "",
        moduleInput: null as unknown as ModuleInput,
      },
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
        moduleId: currentPatchingModule.id,
        output: currentPatchingOutput,
      },
      to: {
        moduleId: payload.moduleInstance.id,
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

const onModuleDrag = (
  deltaX: number,
  deltaY: number,
  module: ModuleInstance
) => {
  module.position.x += deltaX;
  module.position.y += deltaY;

  // Update positions of connections related to this module
  patchGraph.value.connections.forEach((connection) => {
    if (connection.from.moduleId === module.id) {
      connection.from.output.position.x += deltaX;
      connection.from.output.position.y += deltaY;
    }
    if (connection.to.moduleId === module.id) {
      connection.to.input.position.x += deltaX;
      connection.to.input.position.y += deltaY;
    }
  });
};

const onPatchingMouseMove = (deltaX: number, deltaY: number) => {
  if (inProgressConnection.value) {
    inProgressConnection.value!.to!.input!.position.x += deltaX;
    inProgressConnection.value!.to!.input!.position.y += deltaY;
  }
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
            // Disconnect audio nodes
            const fromOuput = selectedConnection.value.from.output
              .moduleOutput as ModuleOutput;
            const toInput = selectedConnection.value.to.input
              .moduleInput as ModuleInput;

            fromOuput.disconnect(toInput);

            // Remove connection from graph
            patchGraph.value.connections = patchGraph.value.connections.filter(
              (c) => c !== selectedConnection.value
            );

            selectedConnection.value = null;
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
    @contextmenu.stop="onGraphContextMenu"
    :style="{ height: `${height}px`, width: `${width}px` }"
    class="patch-window"
    variant="outlined"
  >
    <PatchModule
      v-for="module in patchGraph.modules"
      :key="module.id"
      :moduleInstance="module"
      class="patch-module"
      :style="{ left: module.position.x + 'px', top: module.position.y + 'px' }"
      @mousedown="(e: MouseEvent) => onDragElementStart(e, module)"
      @touchstart="(e: TouchEvent) => onDragElementStart(e, module)"
      @begin-patching="onBeginPatching"
      @finish-patching="onFinishPatching"
    ></PatchModule>

    <PatchConnection
      v-if="inProgressConnection != null"
      :patcherWindowWidth="width"
      :patcherWindowHeight="height"
      :connection="inProgressConnection as ConnectionInstance"
    />

    <PatchConnection
      v-for="(connection, i) in patchGraph.connections"
      :key="i"
      :patcherWindowWidth="width"
      :patcherWindowHeight="height"
      :connection="connection as ConnectionInstance"
      @selected="() => onConnectionSelected(connection as ConnectionInstance)"
    />

    <v-menu
      v-model="showContextMenu"
      :close-on-content-click="true"
      :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
    >
      <v-list>
        <v-list-item @click="addModule">
          <v-list-item-title
            ><v-icon>mdi-plus</v-icon>Add Module</v-list-item-title
          >
        </v-list-item>
      </v-list>
    </v-menu>
  </v-card>
</template>

<style scoped>
.patch-window {
  position: relative;
}
.patch-module {
  position: absolute;
}
</style>
