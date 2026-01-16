import SpeakerOutputModule from "@/classes/audioModules/SpeakerOutputModule";
import OscillatorModule from "@/classes/audioModules/OscillatorModule";
import GainModule from "@/classes/audioModules/GainModule";

export type AudioModuleType = "speaker-output" | "oscillator" | "gain"| "clock";

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
    default:
      throw new Error(`Unknown module type: ${type}`);
  }
}
