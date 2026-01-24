import { ref } from "vue";
import useMouseTracking from "@/composables/useMouseTracking";
import type {
  ConnectionInputInstance,
  ConnectionOutputInstance,
  ModuleInstance,
  PatchCableInstance,
  PatchGraph,
} from "@/types/uIInstanceTypes";
import type Patcher from "@/classes/Patcher";

interface UsePatchingOptions {
  patchGraph: { value: PatchGraph };
  patcher: Patcher;
}

const usePatching = (options: UsePatchingOptions) => {
  const inProgressConnection = ref<PatchCableInstance | null>(null);

  let currentPatchingModule: ModuleInstance | null = null;
  let currentPatchingOutput: ConnectionOutputInstance | null = null;
  let abortPatchingController: AbortController | null = null;
  let abortPatchingSignal: AbortSignal | null = null;

  const isConnected = (
    outputModule: ModuleInstance | null,
    output: ConnectionOutputInstance | null,
    inputModule: ModuleInstance | null,
    input: ConnectionInputInstance | null,
  ): boolean => {
    if (!outputModule || !output || !inputModule || !input) return false;

    return (
      options.patchGraph.value.connections.find((c) => {
        return (
          c.from.output.name === output.name &&
          c.from.moduleId === outputModule.moduleId &&
          c.to.input.name === input.name &&
          c.to.moduleId === inputModule.moduleId
        );
      }) != undefined
    );
  };

  const onPatchingMouseMove = (deltaX: number, deltaY: number) => {
    if (inProgressConnection.value) {
      inProgressConnection.value.to.x += deltaX;
      inProgressConnection.value.to.y += deltaY;
    }
  };

  const { startMouseTracking, stopMouseTracking } =
    useMouseTracking(onPatchingMouseMove);

  const cleanupPatchingListeners = () => {
    if (abortPatchingController) {
      abortPatchingController.abort();
      abortPatchingController = null;
      abortPatchingSignal = null;
    }
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

    cleanupPatchingListeners();
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
      options.patchGraph.value.connections.push({
        from: {
          moduleId: currentPatchingModule.moduleId,
          output: currentPatchingOutput,
        },
        to: {
          moduleId: moduleInstance.moduleId,
          input: inputInstance,
        },
      });

      options.patcher.connect(
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

    cleanupPatchingListeners();
  };

  return {
    inProgressConnection,
    onBeginPatching,
    onFinishPatching,
    cancelPatching,
  };
};

export default usePatching;
