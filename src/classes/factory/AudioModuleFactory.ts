import SpeakerOutputModule from "@/classes/audio-modules/SpeakerOutputModule";
import OscillatorModule from "@/classes/audio-modules/OscillatorModule";
import GainModule from "@/classes/audio-modules/GainModule";
import { type AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ClockModule from "@/classes/audio-modules/ClockModule";
import LoggerModule from "@/classes/audio-modules/LoggerModule";

export function createAudioModule(
  type: AudioModuleType,
  id: string,
  ctx: AudioContext,
  options?: any
) {
  switch (type) {
    case "speaker-output":
      return new SpeakerOutputModule(id, ctx, options);
    case "oscillator":
      return new OscillatorModule(id, ctx, options);
    case "gain":
      return new GainModule(id, ctx, options);
    case "clock":
      return new ClockModule(id, ctx, options);
    case "logger":
      return new LoggerModule(id, ctx, options);
    default:
      throw new Error(`Unknown module type: ${type}`);
  }
}
