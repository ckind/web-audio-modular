import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import AudioParamNode from "@/classes/AudioParamNode";
import * as Tone from "tone";

type GainModuleOptions = {
  gain: number;
};

const getDefaultOptions = (): GainModuleOptions => ({
  gain: 1,
});

export default class GainModule extends AudioModule<GainModuleOptions> {
  private _gainNode: Tone.Gain;

  constructor(id: string, options?: GainModuleOptions) {
    super(id, options ?? getDefaultOptions());
    
    this._gainNode = new Tone.Gain();
    this._gainNode.gain.value = this._options.gain; // Default gain

    // this._outputs = [new ModuleOutput("gain-signal-output", this._gainNode)];
    // this._inputs = [
    //   new ModuleInput("gain-signal-input", this._gainNode),
    //   new ModuleInput("gain-param", this._gainNode.gain),
    // ];
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

  dispose(): void {}
}
