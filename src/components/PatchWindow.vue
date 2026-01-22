<script lang="ts" setup>
import { onMounted, onUnmounted, ref, computed, isProxy, toRaw } from "vue";
import useDragging from "@/composables/useDragging";
import useMouseTracking from "@/composables/useMouseTracking";
import PatchModule from "@/components/PatchModule.vue";
import PatchConnection from "@/components/PatchConnection.vue";
import type {
  PatchGraph,
  PatchCableInstance,
  ModuleInstance,
  ConnectionInstance,
  ConnectionInputInstance,
  ConnectionOutputInstance,
  Position,
} from "@/types/uIInstanceTypes";
import PatchContextMenu from "@/components/PatchContextMenu.vue";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import { createAudioModule } from "@/moduleFactory";
import useResizeObserver from "@/composables/useResizeObserver.ts";
import Patcher from "@/classes/Patcher";
import { useAppColors } from "@/store/appColors";
import { usePatchConsole } from "@/store/patchConsole";
import JSZip from "jszip";
import ResourceFile from "@/classes/ResourceFile";

const appColors = useAppColors();
const patchConsole = usePatchConsole();

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

// pather is used to manage internal audio modules and connections
const patcher = new Patcher();
// patchGraph is used to manage the state of the UI representation of the patch
const patchGraph = ref<PatchGraph>({
  version: import.meta.env.PACKAGE_VERSION,
  modules: [],
  connections: [],
});

let currentPatchingModule: ModuleInstance | null = null;
let currentPatchingOutput: ConnectionOutputInstance | null = null;
let abortPatchingController: AbortController | null = null;
let abortPatchingSignal: AbortSignal | null = null;
// todo: multiple selected modules and connections
const selectedModule = ref<ModuleInstance | null>(null);
const selectedConnection = ref<ConnectionInstance | null>(null);
const inProgressConnection = ref<PatchCableInstance | null>(null);

const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const showClearConfirm = ref(false);

// todo: should think about breaking up this component into smaller pieces
// maybe move load/save patch logic to a separate composable

const savePatch = async () => {
  const zip = new JSZip();

  patchGraph.value.version = import.meta.env.PACKAGE_VERSION;
  const patchData = JSON.stringify(patchGraph.value);
  const blob = new Blob([patchData], { type: "application/json" });

  await saveResourceFiles(zip);
  zip.file("patch.json", blob); // save the patch graph
  zip.generateAsync({ type: "blob" }).then((content) => {
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patch.wam.zip";
    a.click();

    URL.revokeObjectURL(url);
  });
};

const saveResourceFiles = async (zip: JSZip) => {
  const resources = zip.folder("resources");

  for (let i = 0; i < patchGraph.value.modules.length; i++) {
    const keys = Object.keys(patchGraph.value.modules[i]!.options);

    for (let j = 0; j < keys.length; j++) {
      const option = patchGraph.value.modules[i]!.options[keys[j]!];

      if (option instanceof ResourceFile) {
        const resourceFile = option as ResourceFile;

        // todo: do these in parallel
        const response = await fetch(resourceFile.blobUrl!);
        const blob = await response.blob();

        resources!.file(resourceFile.name!, blob);
      }
    }
  }
};

const loadPatch = () => {
  const resourceFileRegex = /^resources\/.+$/;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "*.wam.zip";
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const zip = await JSZip.loadAsync(file);

    const patch = {
      resourceFiles: new Array<ResourceFile>(),
      graphJson: "",
    };

    const blobPromises = new Array<
      Promise<{ relativePath: string; blob: Blob }>
    >();

    zip.forEach((relativePath, zipEntry) => {
      blobPromises.push(
        zipEntry.async("blob").then((blob) => {
          return { relativePath, blob };
        }),
      );
    });

    const blobs = await Promise.all(blobPromises);

    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i]!;
      if (b.relativePath === "patch.json") {
        patch.graphJson = await b.blob.text();
      } else if (resourceFileRegex.test(b.relativePath)) {
        const blobUrl = URL.createObjectURL(b.blob);
        // todo: memory leaks?
        // can we revoke this url after buffer has loaded?
        const fileName = b.relativePath.replace(/.*\//, "");
        patch.resourceFiles.push(new ResourceFile(blobUrl, fileName));
      }
    }

    reconstructPatch(patch.graphJson, patch.resourceFiles);
  };
  input.click();
};

const reconstructPatch = (graphJson: string, resourceFiles: ResourceFile[]) => {
  try {
    const loadedGraph = JSON.parse(graphJson) as PatchGraph;
    patchGraph.value = loadedGraph;

    // Reconstruct patcher state
    patcher.clear();
    elementCache.clear();

    patchGraph.value.modules.forEach((m) => {
      locateResourceFiles(m.options, resourceFiles);

      const module = createAudioModule(
        m.type as AudioModuleType,
        m.moduleId,
        m.options,
      );

      module.updateUIInstanceOptions = (data: any) => {
        m.options = { ...m.options, ...data };
      };

      module.updateUIInstanceOutputs = (
        outputs: ConnectionOutputInstance[],
      ) => {
        m.outputs = outputs.map((o) => {
          return { name: o.name, type: o.type };
        });

        // nuke all outgoing connections
        // todo: only update changed ones?
        patchGraph.value.connections
          .filter((c) => c.from.moduleId === m.moduleId)
          .forEach((c) => deleteConnection(c));
      };

      patcher.addModule(module);
      updateModulePositionStyle(m.moduleId, m.position);
    });

    loadedGraph.connections.forEach((c) => {
      patcher.connect(
        {
          moduleId: c.from.moduleId,
          outputName: c.from.output.name,
        },
        {
          moduleId: c.to.moduleId,
          inputName: c.to.input.name,
        },
      );
    });
  } catch (error) {
    console.error("Error loading patch:", error);
  }
};

const locateResourceFiles = (
  moduleOptions: Record<string, any>,
  resourceFiles: ResourceFile[],
) => {
  Object.keys(moduleOptions).forEach((key) => {
    if (moduleOptions[key].isResourceFile === true) {
      // todo: this assumes names are unique
      // also lookup could be slow with many files
      const file = resourceFiles.find(
        (r) => r.name === moduleOptions[key]!.name,
      );

      moduleOptions[key]!.blobUrl = file?.blobUrl;
    }
  });
};

const clearPatch = () => {
  patcher.clear();
  patchGraph.value = {
    version: import.meta.env.PACKAGE_VERSION,
    modules: [],
    connections: [],
  };
};

const confirmClearPatch = () => {
  clearPatch();
  showClearConfirm.value = false;
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
    type: module.type,
    guiComponent: guiComponent,
    // todo: should we pass in an options deep copy here to the UI instance?
    // this would enforce one-way data flow from UI to the audio module
    options: module.options,
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

  module.updateUIInstanceOptions = (data: any) => {
    // need to query the graph to reference to exact ui instance
    patchGraph.value.modules.find(
      (m) => m.moduleId === moduleInstance.moduleId,
    )!.options = { ...moduleInstance.options, ...data };
  };
  module.updateUIInstanceOutputs = (outputs: ConnectionOutputInstance[]) => {
    // need to query the graph to reference to exact ui instance
    patchGraph.value.modules.find(
      (m) => m.moduleId === moduleInstance.moduleId,
    )!.outputs = outputs.map((o) => {
      return { name: o.name, type: o.type };
    });

    // nuke all outgoing connections
    patchGraph.value.connections
      .filter((c) => c.from.moduleId === moduleInstance.moduleId)
      .forEach((c) => deleteConnection(c));
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
  outputModule: ModuleInstance | null,
  output: ConnectionOutputInstance | null,
  inputModule: ModuleInstance | null,
  input: ConnectionInputInstance | null,
): boolean => {
  if (!outputModule || !output || !inputModule || !input) return false;

  return (
    patchGraph.value.connections.find((c) => {
      return (
        c.from.output.name === output.name &&
        c.from.moduleId === outputModule.moduleId &&
        c.to.input.name === input.name &&
        c.to.moduleId === inputModule.moduleId
      );
    }) != undefined
  );
};

const onBeginPatching = (
  moduleInstance: ModuleInstance,
  outputInstance: ConnectionOutputInstance,
) => {
  console.log("Begin patching from output:", outputInstance);

  inProgressConnection.value = {
    from: {
      x: outputInstance.position.x,
      y: outputInstance.position.y,
    },
    to: {
      x: outputInstance.position.x,
      y: outputInstance.position.y,
    },
    connectionType: outputInstance.type,
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
  inputInstance: ConnectionInputInstance,
) => {
  console.log("Finish patching to input:", inputInstance);

  if (
    isConnected(
      currentPatchingModule,
      currentPatchingOutput,
      moduleInstance,
      inputInstance,
    )
  ) {
    console.warn(
      `${currentPatchingOutput?.name} is already connected to ${inputInstance.name}`,
    );
    return;
  }

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
  options: Record<string, any>,
) => {
  const module = patcher.getModule(moduleId);
  module.updateOptions(options);
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
let ctrlKeyDown = false;

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
        case "Meta":
        case "Control":
          ctrlKeyDown = true;
          break;
        case "d":
        case "D":
          if (ctrlKeyDown) {
            e.preventDefault();
            if (selectedModule.value) {
              duplicateModule(selectedModule.value);
            }
          }
          break;
      }
    },
    { signal: abortKeyListenersSignal },
  );

  document.addEventListener(
    "keyup",
    (e) => {
      switch (e.key) {
        case "Meta":
        case "Control":
          ctrlKeyDown = false;
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

const patchWindowStyle = computed(() => {
  return {};
});

onMounted(() => {
  assignKeyListners();
});

onUnmounted(() => {
  removeKeyListeners();
  patcher.clear();
});
</script>

<template>
  <div
    class="d-flex justify-center mb-4"
    :style="{ width: width + 'px', borderColor: appColors.textColor }"
  >
    <v-btn class="mx-2" @click="savePatch">Save Patch</v-btn>
    <v-btn class="mx-2" @click="loadPatch">Load Patch</v-btn>
    <v-btn class="mx-2" @click="showClearConfirm = true"> Clear Patch </v-btn>
  </div>

  <v-dialog v-model="showClearConfirm" max-width="360">
    <v-card>
      <v-card-title>Clear Patch</v-card-title>
      <v-card-text>
        Any unsaved work will be lost. Are you sure you want to continue?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="showClearConfirm = false">Cancel</v-btn>
        <v-btn color="error" variant="text" @click="confirmClearPatch"
          >Continue</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

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
