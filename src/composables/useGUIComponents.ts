import { type Component } from "vue";
import MessageDisplayModule from "@/components/gui-module-components/MessageDisplayModule.vue";
import ButtonTrigModule from "@/components/gui-module-components/ButtonTrigModule.vue";
import StringInputModule from "@/components/gui-module-components/StringInputModule.vue";
import MidiInputModule from "@/components/gui-module-components/MidiInputModule.vue";
import MidiCCModule from "@/components/gui-module-components/MidiCCModule.vue";
import PatchNotesModule from "@/components/gui-module-components/PatchNotesModule.vue";
import MidiNoteMessageModule from "@/components/gui-module-components/MidiNoteMessageModule.vue";
import SamplerPlusModule from "@/components/gui-module-components/SamplerPlusModule.vue";
import SamplerModule from "@/components/gui-module-components/SamplerModule.vue";
import PlayerModule from "@/components/gui-module-components/PlayerModule.vue";
import GrainPlayerModule from "@/components/gui-module-components/GrainPlayerModule.vue";
import UISliderModule from "@/components/gui-module-components/UISliderModule.vue";
import UIKnobModule from "@/components/gui-module-components/UIKnobModule.vue";
import UISwitchModule from "@/components/gui-module-components/UISwitchModule.vue";
import MonoSynthModule from "@/components/gui-module-components/MonoSynthModule.vue";
import StepSequencerModule from "@/components/gui-module-components/StepSequencerModule.vue";

export default function useGUIComponents() {
  const components: Record<string, Component> = {
    MessageDisplayModule,
    ButtonTrigModule,
    StringInputModule,
    MidiInputModule,
    MidiCCModule,
    PatchNotesModule,
    MidiNoteMessageModule,
    SamplerPlusModule,
    SamplerModule,
    PlayerModule,
    GrainPlayerModule,
    UISliderModule,
    UIKnobModule,
    UISwitchModule,
    MonoSynthModule,
    StepSequencerModule,
  };

  return components;
}
