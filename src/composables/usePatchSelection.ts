import { ref } from "vue";
import type {
  ConnectionInstance,
  ModuleInstance,
} from "@/types/uIInstanceTypes";

export default function usePatchSelection() {
  const selectedModule = ref<ModuleInstance | null>(null);
  const selectedConnection = ref<ConnectionInstance | null>(null);

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

  return {
    selectedModule,
    selectedConnection,
    clearSelection,
    onConnectionSelected,
    onModuleSelected,
  };
}
