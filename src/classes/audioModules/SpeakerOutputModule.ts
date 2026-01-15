import AudioModule from "./AudioModule.ts";
import type { AudioModuleType } from "../factory/AudioModuleFactory.ts";
import ModuleInput from "../ModuleInput.ts";

type SpeakerOutputModuleOptions = {};

const getDefaultOptions = (): SpeakerOutputModuleOptions => ({});

export default class SpeakerOutputModule extends AudioModule<SpeakerOutputModuleOptions> {
  constructor(
    id: string,
    ctx: AudioContext,
    options?: SpeakerOutputModuleOptions
  ) {
    super(id, ctx, options ?? getDefaultOptions());

    this._inputs = [new ModuleInput("speaker-input", this._ctx.destination)];
  }

  get type(): AudioModuleType {
    return "speaker-output";
  }

  updateOptions(options: Partial<SpeakerOutputModuleOptions>): void {
    // No options to update for speaker output
  }

  dispose(): void {
    // No resources to clean up for speaker output
  }
}
