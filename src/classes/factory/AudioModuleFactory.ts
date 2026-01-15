import SpeakerOutputModule from "@/classes/audio-modules/SpeakerOutputModule";
import OscillatorModule from "@/classes/audio-modules/OscillatorModule";
import GainModule from "@/classes/audio-modules/GainModule";

export type AudioModuleType = "speaker-output" | "oscillator" | "gain";

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
      return new GainModule(id, ctx, { gain: 1200 });
    default:
      throw new Error(`Unknown module type: ${type}`);
  }
}
