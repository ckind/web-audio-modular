import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAudioSettings = defineStore("audioSettings", () => {
  const initialized = ref<boolean>(false);

  return {
    initialized: computed(() => initialized.value),

    setInitialized: (value: boolean) => {
      initialized.value = value;
    },
  };
});
