import AudioModule from "./AudioModule.ts";
import type { AudioModuleType } from "./factory/AudioModuleFactory.ts";
import ModuleInput from "./ModuleInput.ts";

export default class SpeakerOutputModule extends AudioModule {
  constructor(ctx: AudioContext) {
    super(ctx);

    this._inputs.set("input", new ModuleInput(this._ctx.destination));
  }

  get type(): AudioModuleType {
    return "speaker-output";
  }
}
