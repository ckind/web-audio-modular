import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAppColors = defineStore("appColors", () => {
  const primaryColor = ref<string>("#fff");
  const signalColor = ref<string>("#fff");
  const messageBusColor = ref<string>("#fff");
  const textColor = ref<string>("#fff");
  const backgroundColor = ref<string>("#fff");

  return {
    primaryColor: computed(() => primaryColor.value),
    signalColor: computed(() => signalColor.value),
    messageBusColor: computed(() => messageBusColor.value),
    textColor: computed(() => textColor.value),
    backgroundColor: computed(() => backgroundColor.value),

    setPrimaryColor: (color: string) => {
      primaryColor.value = color;
    },
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
