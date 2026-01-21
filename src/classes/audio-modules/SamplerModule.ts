import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import * as Tone from "tone";

type SamplerModuleOptions = {
  gain: number;
};

const getDefaultOptions = (): SamplerModuleOptions => ({
  gain: 1,
});

export default class SamplerModule extends AudioModule<SamplerModuleOptions> {
  private _gainNode: Tone.Gain;

  constructor(id: string, options?: SamplerModuleOptions) {
    super(id, options ?? getDefaultOptions());
    
    this._gainNode = new Tone.Gain();
    this._gainNode.gain.value = this._options.gain; // Default gain

    this._outputs = [new ModuleOutput("output", this._gainNode)];
  }

  get type(): AudioModuleType {
    return "sampler";
  }

  updateOptions(options: Partial<SamplerModuleOptions>): void {
    if (options.gain !== undefined) {
      this._gainNode.gain.value = options.gain;
      this._options.gain = options.gain;
    }
  }

  dispose(): void {
    this._gainNode.dispose();
  }
}
