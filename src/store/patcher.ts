import { defineStore } from "pinia";
import { computed, ref } from "vue";
import ModuleOutput from "@/classes/ModuleOutput";

export const usePatcherStore = defineStore("patcher", () => {
  const currentPatcherOutput = ref<ModuleOutput | null>(null);

  return {
    currentPatcherOutput: computed(() => currentPatcherOutput.value),
    setCurrentPatcherOutput: (output: ModuleOutput | null) => {
      currentPatcherOutput.value = output;
      console.log("current patcher output set to", output);
    },
  };
});
