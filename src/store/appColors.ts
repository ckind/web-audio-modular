import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAppColors = defineStore("appColors", () => {
  const signalColor = ref<string>("#fff");
  const messageBusColor = ref<string>("#fff");
  const textColor = ref<string>("#fff");
  const backgroundColor = ref<string>("#fff");

  return {
    signalColor: computed(() => signalColor.value),
    messageBusColor: computed(() => messageBusColor.value),
    textColor: computed(() => textColor.value),
    backgroundColor: computed(() => backgroundColor.value),

    setSignalColor: (color: string) => {
      signalColor.value = color;
    },
    setMessageBusColor: (color: string) => {
      messageBusColor.value = color;
    },
    setTextColor: (color: string) => {
      textColor.value = color;
    },
    setBackgroundColor: (color: string) => {
      backgroundColor.value = color;
    }
  };
});
