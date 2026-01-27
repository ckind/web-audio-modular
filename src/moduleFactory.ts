import type {
  AudioModuleType,
  IAudioModule,
} from "@/classes/audio-modules/AudioModule";
import SpeakerOutputModule from "@/classes/audio-modules/SpeakerOutputModule";
import OscillatorModule from "@/classes/audio-modules/OscillatorModule";
import GainModule from "@/classes/audio-modules/GainModule";
import ClockModule from "@/classes/audio-modules/ClockModule";
import LoggerModule from "@/classes/audio-modules/LoggerModule";
import ScaleModule from "@/classes/audio-modules/ScaleModule";
import NumberToSignalModule from "@/classes/audio-modules/NumberToSignalModule";
import SequenceModule from "@/classes/audio-modules/SequenceModule";
import StepSequencerModule from "@/classes/audio-modules/StepSequencerModule";
import UISliderModule from "@/classes/audio-modules/UISliderModule";
import MessageDisplayModule from "@/classes/audio-modules/MessageDisplayModule";
import FilterModule from "@/classes/audio-modules/FilterModule";
import ConvolutionReverbModule from "@/classes/audio-modules/ConvolutionReverbModule";
import ButtonTrigModule from "@/classes/audio-modules/ButtonTrigModule";
import NoiseModule from "@/classes/audio-modules/NoiseModule";
import ADSREnvelopeModule from "@/classes/audio-modules/ADSREnvelopeModule";
import MidiInputModule from "@/classes/audio-modules/MidiInputModule";
import MidiCCModule from "@/classes/audio-modules/MidiCCModule";
import PatchNotesModule from "@/classes/audio-modules/PatchNotesModule";
import MidiNoteMessageModule from "@/classes/audio-modules/MidiNoteMessageModule";
import ADSRAmplitudeModule from "@/classes/audio-modules/ADSRAmplitudeModule";
import StringInputModule from "@/classes/audio-modules/StringInputModule";
import MidiNumToHzModule from "@/classes/audio-modules/MidiNumToHzModule";
import SamplerPlusModule from "@/classes/audio-modules/SamplerPlusModule";
import MessageRegexModule from "@/classes/audio-modules/MessageRegexModule";
import NumberCounterModule from "@/classes/audio-modules/NumberCounterModule";
import NumberModModule from "@/classes/audio-modules/NumberModModule";
import NumberAddModule from "@/classes/audio-modules/NumberAddModule";
import NumberMultiplyModule from "@/classes/audio-modules/NumberMultiplyModule";
import SampleModule from "@/classes/audio-modules/SampleModule";
import SampleAndHoldModule from "@/classes/audio-modules/SampleAndHoldModule";
import FxDelayModule from "@/classes/audio-modules/FxDelayModule";
import FxDelayAnalogModule from "@/classes/audio-modules/FxDelayAnalogModule";
import UISliderMessageModule from "@/classes/audio-modules/UISliderMessageModule";
import DelayModule from "@/classes/audio-modules/DelayModule";
import SamplerModule from "@/classes/audio-modules/SamplerModule";
import PlayerModule from "@/classes/audio-modules/PlayerModule";
import GrainPlayerModule from "@/classes/audio-modules/GrainPlayerModule";
import MonoSynthModule from "@/classes/audio-modules/MonoSynthModule";
import PulseOscillatorModule from "@/classes/audio-modules/PulseOscillatorModule";
import FMOscillatorModule from "@/classes/audio-modules/FMOscillatorModule";
import ConstantSignalModule from "@/classes/audio-modules/ConstantSignalModule";
import UIKnobModule from "@/classes/audio-modules/UIKnobModule";
import RotaryKnobMessageModule from "@/classes/audio-modules/RotaryKnobMessageModule";
import UISwitchModule from "@/classes/audio-modules/UISwitchModule";
import ListElementModule from "@/classes/audio-modules/ListElementModule";
import ListMergeModule from "@/classes/audio-modules/ListMergeModule"

export function createAudioModule(
  type: AudioModuleType,
  id: string,
  options?: any,
): IAudioModule<Record<string, any>> {
  switch (type) {
    case "speaker-output":
      return new SpeakerOutputModule(id, options);
    case "osc":
      return new OscillatorModule(id, options);
    case "osc-pulse":
      return new PulseOscillatorModule(id, options);
    case "osc-fm":
      return new FMOscillatorModule(id, options);
    case "constant-signal":
      return new ConstantSignalModule(id, options);
    case "gain":
      return new GainModule(id, options);
    case "clock":
      return new ClockModule(id, options);
    case "logger":
      return new LoggerModule(id, options);
    case "scale":
      return new ScaleModule(id, options);
    case "num-to-signal":
      return new NumberToSignalModule(id, options);
    case "sequence":
      return new SequenceModule(id, options);
    case "seq-step":
      return new StepSequencerModule(id, options);
    case "ui-slider":
      return new UISliderModule(id, options);
    case "ui-knob":
      return new UIKnobModule(id, options);
    case "ui-knob-msg":
      return new RotaryKnobMessageModule(id, options);
    case "ui-slider-msg":
      return new UISliderMessageModule(id, options);
    case "msg-display":
      return new MessageDisplayModule(id, options);
    case "filter":
      return new FilterModule(id, options);
    case "fx-convolution-reverb":
      return new ConvolutionReverbModule(id, options);
    case "ui-switch":
      return new UISwitchModule(id, options);
    case "ui-button":
      return new ButtonTrigModule(id, options);
    case "noise":
      return new NoiseModule(id, options);
    case "env-adsr":
      return new ADSREnvelopeModule(id, options);
    case "midi-input":
      return new MidiInputModule(id, options);
    case "midi-cc":
      return new MidiCCModule(id, options);
    case "patch-notes":
      return new PatchNotesModule(id, options);
    case "midi-note-message":
      return new MidiNoteMessageModule(id, options);
    case "env-amp":
      return new ADSRAmplitudeModule(id, options);
    case "str-input":
      return new StringInputModule(id, options);
    case "midi-num-to-hz":
      return new MidiNumToHzModule(id, options);
    case "sampler":
      return new SamplerModule(id, options);
    case "synth-mono":
      return new MonoSynthModule(id, options);
    case "sampler-plus":
      return new SamplerPlusModule(id, options);
    case "player":
      return new PlayerModule(id, options);
    case "grain-player":
      return new GrainPlayerModule(id, options);
    case "msg-regex":
      return new MessageRegexModule(id, options);
    case "num-counter":
      return new NumberCounterModule(id, options);
    case "num-mod":
      return new NumberModModule(id, options);
    case "num-add":
      return new NumberAddModule(id, options);
    case "num-multiply":
      return new NumberMultiplyModule(id, options);
    case "list-element":
      return new ListElementModule(id, options);
    case "list-merge":
      return new ListMergeModule(id, options);
    case "sample":
      return new SampleModule(id, options);
    case "sample-and-hold":
      return new SampleAndHoldModule(id, options);
    case "fx-delay":
      return new FxDelayModule(id, options);
    case "fx-delay-analog":
      return new FxDelayAnalogModule(id, options);
    case "delay":
      return new DelayModule(id, options);
    default:
      throw new Error(`Unknown module type: ${type}`);
  }
}
