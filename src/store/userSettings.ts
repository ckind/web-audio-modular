import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserSettings = defineStore(
  "userSettings",
  () => {
    const isDarkMode = ref<boolean | undefined>(undefined);

    return {
      isDarkMode
    };
  },
  { persist: true },
);
