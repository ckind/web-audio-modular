<script lang="ts" setup>
import { ref } from "vue";
import useDragging from "@/composables/useDragging";
import useMouseTracking from "@/composables/useMouseTracking";
import PatchModule from "@/components/PatchModule.vue";
import PatchConnection from "./PatchConnection.vue";
import AudioModule from "@/classes/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import type { AudioModuleType } from "@/classes/factory/AudioModuleFactory";

export type Position = {
  x: number;
  y: number;
};

export type ConnectionInstance = {
  from: {
    moduleId: string;
    output: OutputInstance;
  };
  to: {
    moduleId: string;
    input: InputInstance;
  };
};

export type InputInstance = {
  name: string;
  moduleInput: ModuleInput;
  position: Position;
};

export type OutputInstance = {
  name: string;
  moduleOutput: ModuleOutput;
  position: Position;
};

export type ModuleInstance = {
  id: string;
  type: AudioModuleType;
  position: Position;
};

export type PatchGraph = {
  modules: ModuleInstance[];
  connections: ConnectionInstance[];
};

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

const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

let currentPatchingModule: ModuleInstance | null = null;
let currentPatchingOutput: OutputInstance | null = null;
let abortPatchingController: AbortController | null = null;
let abortPatchingSignal: AbortSignal | null = null;
const selectedConnection = ref<ConnectionInstance | null>(null);
const inProgressConnection = ref<ConnectionInstance | null>(null);

const onGraphContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  contextMenuX.value = e.pageX;
  contextMenuY.value = e.pageY;
  showContextMenu.value = true;
};

const addModule = () => {
  showContextMenu.value = false;
};

const onBeginPatching = (payload: {
  moduleInstance: ModuleInstance;
  output: OutputInstance;
}) => {
  console.log("Begin patching from output:", payload.output);

  inProgressConnection.value = {
    from: {
      moduleId: payload.moduleInstance.id,
      output: payload.output,
    },
    to: {
      moduleId: "",
      input: {
        position: {
          x: payload.output.position.x,
          y: payload.output.position.y,
        },
        name: "",
        moduleInput: null as unknown as ModuleInput,
      },
    },
  };

  currentPatchingOutput = payload.output;
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
  input: InputInstance;
}) => {
  console.log("Finish patching to input:", payload.input);

  stopMouseTracking();

  if (currentPatchingOutput && currentPatchingModule) {
    patchGraph.value.connections.push({
      from: {
        moduleId: currentPatchingModule.id,
        output: currentPatchingOutput,
      },
      to: {
        moduleId: payload.moduleInstance.id,
        input: payload.input,
      },
    });

    currentPatchingOutput.moduleOutput.connect(payload.input.moduleInput);
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
