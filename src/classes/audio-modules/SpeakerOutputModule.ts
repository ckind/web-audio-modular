import AudioModule from "./AudioModule.ts";
import type { AudioModuleType } from "../factory/AudioModuleFactory.ts";
import ModuleInput from "../ModuleInput.ts";

type SpeakerOutputModuleOptions = {};

export default class SpeakerOutputModule extends AudioModule<SpeakerOutputModuleOptions> {
  constructor(
    id: string,
    ctx: AudioContext,
    options?: SpeakerOutputModuleOptions
  ) {
    super(id, ctx, options);
    this._inputs = [new ModuleInput("input", this._ctx.destination)];
  }

  get type(): AudioModuleType {
    return "speaker-output";
  }
  
  updateOptions(options: SpeakerOutputModuleOptions): void {
    // No options to update for speaker output
  }
}
