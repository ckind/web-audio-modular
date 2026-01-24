import { isProxy, toRaw, type Ref } from "vue";
import type {
  ModuleInstance,
  PatchGraph,
  Position,
} from "@/types/uIInstanceTypes";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import { createAudioModule } from "@/moduleFactory";
import JSZip from "jszip";
import ResourceFile from "@/classes/ResourceFile";
import ResourceFileManager from "@/classes/ResourceFileManager";
import Patcher from "@/classes/Patcher";

ResourceFileManager.debug = true;

interface PatchPersistenceOptions {
  patchGraph: Ref<PatchGraph>;
  patcher: Patcher;
  updateModulePositionStyle: (moduleId: string, position: Position) => void;
  onBeforeReconstruct?: () => void;
  onBeforeLoad?: () => void;
}

export default function usePatchPersistence(options: PatchPersistenceOptions) {
  const deepCloneModuleOptions = (opts: Record<string, any>) => {
    const rawOptions = isProxy(opts) ? toRaw(opts) : opts;
    const clonedOptions = structuredClone(rawOptions);

    return clonedOptions;
  };

  const locateResourceFiles = (moduleOptions: Record<string, any>) => {
    Object.keys(moduleOptions).forEach((key) => {
      const opt = moduleOptions[key];
      if (opt?.isResourceFile === true && opt?.name) {
        // Acquire a managed reference to ensure RAII validity
        const url = ResourceFileManager.requestResource(opt.name);
        if (!url) {
          console.warn(
            `Resource "${opt.name}" not found in manager during reconstruction`,
          );
        }
      }
    });
  };

  const releaseModuleInstanceResources = (moduleInstance: ModuleInstance) => {
    const opts = moduleInstance.options as Record<string, any>;
    Object.keys(opts).forEach((k) => {
      const o = toRaw(opts[k]);
      if (o?.isResourceFile === true && o?.name) {
        ResourceFileManager.releaseResource(o.name);
      }
    });
  };

  const releaseGraphResources = (graph: PatchGraph) => {
    try {
      graph.modules.forEach((m) => {
        releaseModuleInstanceResources(m as ModuleInstance);
      });
    } catch (err) {
      console.warn("releaseGraphResources encountered an error:", err);
    }
  };

  const saveResourceFiles = async (zip: JSZip) => {
    const resources = zip.folder("resources");

    for (let i = 0; i < options.patchGraph.value.modules.length; i++) {
      const keys = Object.keys(options.patchGraph.value.modules[i]!.options);

      for (let j = 0; j < keys.length; j++) {
        const option = options.patchGraph.value.modules[i]!.options[keys[j]!];
        // Support both class instance and plain object deserialized from JSON
        const isRes =
          option instanceof ResourceFile || option?.isResourceFile === true;

        if (isRes && option?.name) {
          // todo: do these in parallel
          const url = ResourceFileManager.requestResource(option.name);
          if (!url) {
            console.warn(
              `saveResourceFiles: resource "${option.name}" not found in manager.`,
            );
            continue;
          }
          try {
            const response = await fetch(url);
            const blob = await response.blob();

            resources!.file(option.name, blob);
          } finally {
            ResourceFileManager.releaseResource(option.name);
          }
        }
      }
    }
  };

  const savePatch = async () => {
    const zip = new JSZip();

    options.patchGraph.value.version = import.meta.env.PACKAGE_VERSION;
    const patchData = JSON.stringify(options.patchGraph.value);
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

  const unzipPatchFile = async (file: File) => {
    const resourceFileRegex = /^resources\/.+$/;
    const zip = await JSZip.loadAsync(file);

    let registeredResourceNames: string[] = [];
    let graphJson = "";

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
        graphJson = await b.blob.text();
      } else if (resourceFileRegex.test(b.relativePath)) {
        const fileName = b.relativePath.replace(/.*\//, "");
        ResourceFileManager.registerResource(fileName, b.blob);
        registeredResourceNames.push(fileName);
      }
    }

    return { graphJson, registeredResourceNames };
  };

  const reconstructPatch = (graphJson: string) => {
    try {
      const loadedGraph = JSON.parse(graphJson) as PatchGraph;
      options.patchGraph.value = loadedGraph;

      // Reconstruct patcher state
      options.patcher.clear();
      options.onBeforeReconstruct?.();

      options.patchGraph.value.modules.forEach((m) => {
        locateResourceFiles(m.options);

        // create deep copy of options so UI model and audio graph model
        // are decoupled. state is shared between the two via dedicated methods
        const module = createAudioModule(
          m.type as AudioModuleType,
          m.moduleId,
          deepCloneModuleOptions(m.options),
        );

        module.updateUIState = (options: any, guiState?: any) => {
          if (options) {
            m.options = { ...m.options, ...options };
          }

          if (guiState) {
            m.guiState = { ...m.guiState, ...guiState };
          }
        };

        options.patcher.addModule(module);
        options.updateModulePositionStyle(m.moduleId, m.position);
      });

      loadedGraph.connections.forEach((c) => {
        options.patcher.connect(
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

  const loadPatch = () => {
    options.onBeforeLoad?.();

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*.wam.zip";
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // deserialize patch graph and register resource files
      const { graphJson, registeredResourceNames } = await unzipPatchFile(file);

      try {
        reconstructPatch(graphJson);
      } finally {
        // Clean up registered resource files
        registeredResourceNames.forEach((name) => {
          ResourceFileManager.releaseResource(name);
        });
      }

      // Clean up after handling the file
      input.remove();
      input.onchange = null;
    };

    input.oncancel = () => {
      input.remove();
      input.onchange = null;
    };

    input.click();
  };

  return {
    deepCloneModuleOptions,
    locateResourceFiles,
    releaseGraphResources,
    releaseModuleInstanceResources,
    savePatch,
    loadPatch,
  };
}
