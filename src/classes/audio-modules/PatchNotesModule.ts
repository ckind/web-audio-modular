import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";

export type PatchNotesModuleOptions = {
  notes: string;
};

const getDefaultOptions = (): PatchNotesModuleOptions => ({
  notes: "",
});

export default class PatchNotesModule extends AudioModule<PatchNotesModuleOptions> {
  constructor(id: string, options?: PatchNotesModuleOptions) {
    super(id, options ?? getDefaultOptions());
  }

  get type(): AudioModuleType {
    return "patch-notes";
  }

  updateOptions(options: Partial<PatchNotesModuleOptions>): void {
    if (options.notes !== undefined) {
      this._options.notes = options.notes;
    }
  }

  dispose(): void {
    // no resources to clean up for this module
  }
}
