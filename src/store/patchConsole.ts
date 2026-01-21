import { defineStore } from "pinia";
import { computed, ref } from "vue";

type PatchConsoleMessageType = "info" | "warn" | "error";

type PatchConsoleMessage = {
  timestamp: number;
  content: string;
  type: PatchConsoleMessageType;
};

export const usePatchConsole = defineStore("patchConsole", () => {
  const messages = ref<Array<PatchConsoleMessage>>([]);

  return {
    messages: computed(() => messages.value),
    latestMessage: computed(() => {
      if (messages.value.length === 0) return null;
      return messages.value[messages.value.length - 1];
    }),

    logError: (message: string) => {
      messages.value.push({
        timestamp: Date.now(),
        content: message,
        type: "error",
      });
    },
    logWarning: (message: string) => {
      messages.value.push({
        timestamp: Date.now(),
        content: message,
        type: "warn",
      });
    },
    logInfo: (message: string) => {
      messages.value.push({
        timestamp: Date.now(),
        content: message,
        type: "info",
      });
    },
  };
});
