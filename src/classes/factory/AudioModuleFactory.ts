import SpeakerOutputModule from "@/classes/audio-modules/SpeakerOutputModule";
import OscillatorModule from "@/classes/audio-modules/OscillatorModule";
import GainModule from "@/classes/audio-modules/GainModule";
import type { AudioModuleType, IAudioModule, UpdateUIStateCallback } from "@/classes/audio-modules/AudioModule";
import ClockModule from "@/classes/audio-modules/ClockModule";
import LoggerModule from "@/classes/audio-modules/LoggerModule";
import ScaleModule from "@/classes/audio-modules/ScaleModule";
import MessageToSignalModule from "@/classes/audio-modules/MessageToSignalModule";
import SequenceModule from "@/classes/audio-modules/SequenceModule";
import SliderModule from "@/classes/audio-modules/SliderModule";
import DisplayMessageModule from "@/classes/audio-modules/DisplayMessageModule";

export function createAudioModule(
  type: AudioModuleType,
  id: string,
  options?: any
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
    case "message-to-signal":
      return new MessageToSignalModule(id, options);
    case "sequence":
      return new SequenceModule(id, options);
    case "slider":
      return new SliderModule(id, options);
    case "display-message":
      return new DisplayMessageModule(id, options);
    default:
      throw new Error(`Unknown module type: ${type}`);
  }
}
