import { type Component } from "vue";
import SliderModule from "@/components/gui-module-components/SliderModule.vue";
import DisplayMessageModule from "@/components/gui-module-components/DisplayMessageModule.vue";
import ButtonTrigModule from "@/components/gui-module-components/ButtonTrigModule.vue";

export default function useGUIComponents() {
  const components: Record<string, Component> = {
    SliderModule,
    DisplayMessageModule,
    ButtonTrigModule,
  };

  return components;
}