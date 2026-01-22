import { type Component } from "vue";
import SliderModule from "@/components/gui-module-components/SliderModule.vue";
import DisplayMessageModule from "@/components/gui-module-components/DisplayMessageModule.vue";
import ButtonTrigModule from "@/components/gui-module-components/ButtonTrigModule.vue";
import MessageTrigModule from "@/components/gui-module-components/MessageTrigModule.vue";
import MidiInputModule from "@/components/gui-module-components/MidiInputModule.vue";
import MidiCCModule from "@/components/gui-module-components/MidiCCModule.vue";
import PatchNotesModule from "@/components/gui-module-components/PatchNotesModule.vue";
import MidiNoteMessageModule from "@/components/gui-module-components/MidiNoteMessageModule.vue";
import SamplerPlusModule from "@/components/gui-module-components/SamplerPlusModule.vue";
import SamplerModule from "@/components/gui-module-components/SamplerModule.vue";
import PlayerModule from "@/components/gui-module-components/PlayerModule.vue";
import GrainPlayerModule from "@/components/gui-module-components/GrainPlayerModule.vue";

export default function useGUIComponents() {
  const components: Record<string, Component> = {
    SliderModule,
    DisplayMessageModule,
    ButtonTrigModule,
    MessageTrigModule,
    MidiInputModule,
    MidiCCModule,
    PatchNotesModule,
    MidiNoteMessageModule,
    SamplerPlusModule,
    SamplerModule,
    PlayerModule,
    GrainPlayerModule
  };

  return components;
}
