import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import * as Tone from "tone";

type ConvolutionReverbModuleOptions = {
  preDelay: number;
  decay: number;
  wet: 1;
};

const getDefaultOptions = (): ConvolutionReverbModuleOptions => ({
  preDelay: 0.2,
  decay: 4,
  wet: 1,
});

export default class ConvolutionReverbModule extends AudioModule<ConvolutionReverbModuleOptions> {
  private _reverbNode: Tone.Reverb;

  constructor(id: string, options?: ConvolutionReverbModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._reverbNode = new Tone.Reverb();
    this._reverbNode.wet.value = 1;

    this._outputs = [
      new ModuleOutput("reverb-signal-output", this._reverbNode),
    ];
    this._inputs = [new ModuleInput("reverb-signal-input", this._reverbNode)];
  }

  get type(): AudioModuleType {
    return "convolution-reverb";
  }

  updateOptions(options: Partial<ConvolutionReverbModuleOptions>): void {
    if (options.preDelay !== undefined) {
      this._reverbNode.preDelay = options.preDelay;
      this._options.preDelay = options.preDelay;
    }
    if (options.decay !== undefined) {
      this._reverbNode.decay = options.decay;
      this._options.decay = options.decay;
    }
    if (options.wet !== undefined) {
      this._reverbNode.wet.value = options.wet;
      this._options.wet = options.wet;
    }
  }

  dispose(): void {
    this._reverbNode.dispose();
  }
}
