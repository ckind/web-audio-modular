import SpeakerOutputModule from "@/classes/SpeakerOutputModule";
import OscillatorModule from "@/classes/OscillatorModule";

export type AudioModuleType = "speaker-output" | "oscillator";

export function createAudioModule(type: AudioModuleType, ctx: AudioContext) {
  switch (type) {
    case "speaker-output":
      return new SpeakerOutputModule(ctx);
    case "oscillator":
      return new OscillatorModule(ctx);
    default:
      throw new Error(`Unknown module type: ${type}`);
  }
}