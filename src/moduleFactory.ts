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
import MessageToSignalModule from "@/classes/audio-modules/MessageToSignalModule";
import SequenceModule from "@/classes/audio-modules/SequenceModule";
import SliderModule from "@/classes/audio-modules/SliderModule";
import DisplayMessageModule from "@/classes/audio-modules/DisplayMessageModule";
import FilterModule from "@/classes/audio-modules/FilterModule";
import ScaleExpModule from "@/classes/audio-modules/ScaleExpModule";
import ConvolutionReverbModule from "@/classes/audio-modules/ConvolutionReverbModule";
import ButtonTrigModule from "@/classes/audio-modules/ButtonTrigModule";
import NoiseModule from "@/classes/audio-modules/NoiseModule";
import ADSREnvelopeModule from "@/classes/audio-modules/ADSREnvelopeModule";
import MidiInputModule from "@/classes/audio-modules/MidiInputModule";
import MidiCCModule from "@/classes/audio-modules/MidiCCModule";
import PowCurveModule from "@/classes/audio-modules/PowCurveModule";
import PatchNotesModule from "@/classes/audio-modules/PatchNotesModule";
import MidiNoteMessageModule from "@/classes/audio-modules/MidiNoteMessageModule";
import ADSRAmplitudeModule from "@/classes/audio-modules/ADSRAmplitudeModule";
import MessageTrigModule from "@/classes/audio-modules/MessageTrig";
import MidiNumToHzModule from "@/classes/audio-modules/MidiNumToHzModule";
import SplitModule from "@/classes/audio-modules/SplitModule";
import SamplerPlusModule from "@/classes/audio-modules/SamplerPlusModule";
import MessageRegexModule from "@/classes/audio-modules/MessageRegexModule";
import MessageSampleSignalModule from "@/classes/audio-modules/MessageSampleSignalModule";
import SampleAndHoldModule from "@/classes/audio-modules/SampleAndHoldModule";
import FxDelayModule from "@/classes/audio-modules/FxDelayModule";
import FxDelayAnalogModule from "@/classes/audio-modules/FxDelayAnalogModule";
import SliderMessageModule from "@/classes/audio-modules/SliderMessageModule";
import DelayModule from "@/classes/audio-modules/DelayModule";
import SamplerModule from "@/classes/audio-modules/SamplerModule";
import PlayerModule from "@/classes/audio-modules/PlayerModule";
import GrainPlayerModule from "@/classes/audio-modules/GrainPlayerModule";
import PulseOscillatorModule from "@/classes/audio-modules/PulseOscillatorModule";

export function createAudioModule(
  type: AudioModuleType,
  id: string,
  options?: any,
): IAudioModule {
  switch (type) {
    case "speaker-output":
      return new SpeakerOutputModule(id, options);
    case "osc":
      return new OscillatorModule(id, options);
    case "osc-pulse":
      return new PulseOscillatorModule(id, options);
    case "gain":
      return new GainModule(id, options);
    case "clock":
      return new ClockModule(id, options);
    case "logger":
      return new LoggerModule(id, options);
    case "scale":
      return new ScaleModule(id, options);
    case "scale-exp":
      return new ScaleExpModule(id, options);
    case "pow-curve":
      return new PowCurveModule(id, options);
    case "msg-to-signal":
      return new MessageToSignalModule(id, options);
    case "sequence":
      return new SequenceModule(id, options);
    case "ui-slider":
      return new SliderModule(id, options);
    case "ui-slider-msg":
      return new SliderMessageModule(id, options);
    case "msg-display":
      return new DisplayMessageModule(id, options);
    case "filter":
      return new FilterModule(id, options);
    case "fx-convolution-reverb":
      return new ConvolutionReverbModule(id, options);
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
    case "msg-box":
      return new MessageTrigModule(id, options);
    case "midi-num-to-hz":
      return new MidiNumToHzModule(id, options);
    case "split":
      return new SplitModule(id, options);
    case "sampler":
      return new SamplerModule(id, options);
    case "sampler-plus":
      return new SamplerPlusModule(id, options);
    case "player":
      return new PlayerModule(id, options);
    case "grain-player":
      return new GrainPlayerModule(id, options);
    case "msg-regex":
      return new MessageRegexModule(id, options);
    case "msg-sample":
      return new MessageSampleSignalModule(id, options);
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
