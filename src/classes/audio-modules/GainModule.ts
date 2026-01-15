import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/factory/AudioModuleFactory";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";

type GainModuleOptions = {
  gain: number;
};

const getDefaultOptions = (): GainModuleOptions => ({
  gain: 1,
});

export default class GainModule extends AudioModule<GainModuleOptions> {
  private _gainNode: GainNode;

  constructor(id: string, ctx: AudioContext, options?: GainModuleOptions) {
    super(id, ctx, options ?? getDefaultOptions());
    
    this._gainNode = ctx.createGain();
    this._gainNode.gain.value = this._options.gain; // Default gain

    this._outputs = [new ModuleOutput("output", this._gainNode)];
    this._inputs = [
      new ModuleInput("input", this._gainNode),
      new ModuleInput("gain", this._gainNode.gain),
    ];
  }

  get type(): AudioModuleType {
    return "gain";
  }

  updateOptions(options: Partial<GainModuleOptions>): void {
    if (options.gain !== undefined) {
      this._gainNode.gain.value = options.gain;
      this._options.gain = options.gain;
    }
  }
}
