import { type Component } from "vue";
import SliderModule from "@/components/gui-module-components/SliderModule.vue";
import DisplayMessageModule from "@/components/gui-module-components/DisplayMessageModule.vue";

export default function useGUIComponents() {
  const components: Record<string, Component> = {
    SliderModule,
    DisplayMessageModule,
  };

  return components;
}