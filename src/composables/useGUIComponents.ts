import { type Component } from "vue";
import SliderModule from "@/components/gui-module-components/SliderModule.vue";

export default function useGUIComponents() {
  const components: Record<string, Component> = {
    SliderModule,
  };

  return components;
}