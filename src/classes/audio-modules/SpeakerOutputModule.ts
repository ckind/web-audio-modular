import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes/ModuleInput.ts";
import * as Tone from "tone";

type SpeakerOutputModuleOptions = {};

const getDefaultOptions = (): SpeakerOutputModuleOptions => ({});

export default class SpeakerOutputModule extends AudioModule<SpeakerOutputModuleOptions> {
  constructor(
    id: string,
    options?: SpeakerOutputModuleOptions
  ) {
    super(id, options ?? getDefaultOptions());

    this._inputs = [new ModuleInput("speaker-input", Tone.getDestination())];
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
