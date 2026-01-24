import type { Ref } from "vue";
import type {
  ConnectionInstance,
  ModuleInstance,
  PatchCableInstance,
} from "@/types/uIInstanceTypes";

interface PatchShortcutOptions {
  selectedModule: Ref<ModuleInstance | null>;
  selectedConnection: Ref<ConnectionInstance | null>;
  inProgressConnection: Ref<PatchCableInstance | null>;
  cancelPatching: () => void;
  deleteConnection: (connection: ConnectionInstance) => void;
  deleteModule: (moduleId: string) => void;
  duplicateModule: (module: ModuleInstance) => void;
  clearSelection: () => void;
}

export default function usePatchShortcuts(options: PatchShortcutOptions) {
  let abortKeyListenersController: AbortController | null = null;
  let abortKeyListenersSignal: AbortSignal | null = null;
  let ctrlKeyDown = false;

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        if (options.inProgressConnection.value) {
          options.cancelPatching();
        }
        break;
      case "Backspace":
      case "Delete":
        if (options.selectedConnection.value) {
          options.deleteConnection(options.selectedConnection.value);
          options.clearSelection();
        }
        if (options.selectedModule.value) {
          options.deleteModule(options.selectedModule.value.moduleId);
          options.clearSelection();
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
          if (options.selectedModule.value) {
            options.duplicateModule(options.selectedModule.value);
          }
        }
        break;
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Meta":
      case "Control":
        ctrlKeyDown = false;
        break;
    }
  };

  const assignKeyListeners = () => {
    abortKeyListenersController = new AbortController();
    abortKeyListenersSignal = abortKeyListenersController.signal;

    document.addEventListener("keydown", onKeyDown, {
      signal: abortKeyListenersSignal,
    });

    document.addEventListener("keyup", onKeyUp, {
      signal: abortKeyListenersSignal,
    });
  };

  const removeKeyListeners = () => {
    if (abortKeyListenersController) {
      abortKeyListenersController.abort();
      abortKeyListenersController = null;
      abortKeyListenersSignal = null;
    }
  };

  return {
    assignKeyListeners,
    removeKeyListeners,
  };
}
