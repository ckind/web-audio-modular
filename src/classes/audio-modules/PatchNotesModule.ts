import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";

type PatchNotesOptions = {
  notes: string;
};

const getDefaultOptions = (): PatchNotesOptions => ({
  notes: "",
});

export default class PatchNotesModule extends AudioModule<PatchNotesOptions> {
  constructor(id: string, options?: PatchNotesOptions) {
    super(id, options ?? getDefaultOptions());
  }

  get type(): AudioModuleType {
    return "patch-notes";
  }

  updateOptions(options: Partial<PatchNotesOptions>): void {
    if (options.notes !== undefined) {
      this._options.notes = options.notes;
    }
  }

  dispose(): void {
    // no resources to clean up for this module
  }
}
