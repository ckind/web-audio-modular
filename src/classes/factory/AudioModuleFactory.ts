import SpeakerOutputModule from "@/classes/audio-modules/SpeakerOutputModule";
import OscillatorModule from "@/classes/audio-modules/OscillatorModule";
import GainModule from "@/classes/audio-modules/GainModule";
import type {
  AudioModuleType,
  IAudioModule,
} from "@/classes/audio-modules/AudioModule";
import ClockModule from "@/classes/audio-modules/ClockModule";
import LoggerModule from "@/classes/audio-modules/LoggerModule";
import ScaleModule from "@/classes/audio-modules/ScaleModule";
import MessageToSignalModule from "@/classes/audio-modules/MessageToSignalModule";
import SequenceModule from "@/classes/audio-modules/SequenceModule";
import SliderModule from "@/classes/audio-modules/SliderModule";
import DisplayMessageModule from "@/classes/audio-modules/DisplayMessageModule";
import FilterModule from "@/classes/audio-modules/FilterModule";
import ScaleExpModule from "@/classes/audio-modules/ScaleExpModule";
import ConvolutionReverbModule from "../audio-modules/ConvolutionReverbModule";
import ButtonTrigModule from "@/classes/audio-modules/ButtonTrigModule";
import NoiseModule from "@/classes/audio-modules/NoiseModule";
import ADSREnvelopeModule from "@/classes/audio-modules/ADSREnvelopeModule";
import MidiInputModule from "@/classes/audio-modules/MidiInputModule";
import MidiCCToSignalModule from "@/classes/audio-modules/MidiCCToSignal";
import PowCurveModule from "@/classes/audio-modules/PowCurveModule";
import PatchNotesModule from "@/classes/audio-modules/PatchNotesModule";

export function createAudioModule(
  type: AudioModuleType,
  id: string,
  options?: any,
): IAudioModule {
  switch (type) {
    case "speaker-output":
      return new SpeakerOutputModule(id, options);
    case "oscillator":
      return new OscillatorModule(id, options);
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
    case "message-to-signal":
      return new MessageToSignalModule(id, options);
    case "sequence":
      return new SequenceModule(id, options);
    case "slider":
      return new SliderModule(id, options);
    case "display-message":
      return new DisplayMessageModule(id, options);
    case "filter":
      return new FilterModule(id, options);
    case "convolution-reverb":
      return new ConvolutionReverbModule(id, options);
    case "button-trig":
      return new ButtonTrigModule(id, options);
    case "noise":
      return new NoiseModule(id, options);
    case "adsr-envelope":
      return new ADSREnvelopeModule(id, options);
    case "midi-input":
      return new MidiInputModule(id, options);
    case "midi-cc-to-signal":
      return new MidiCCToSignalModule(id, options);
    case "patch-notes":
      return new PatchNotesModule(id, options);
    default:
      throw new Error(`Unknown module type: ${type}`);
  }
}
