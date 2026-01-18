import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import * as Tone from "tone";

type ScaleExpModuleOptions = {
  min: number;
  max: number;
};

const getDefaultOptions = (): ScaleExpModuleOptions => ({
  min: 0,
  max: 1,
});

export default class ScaleExpModule extends AudioModule<ScaleExpModuleOptions> {
  private _scaleNode: Tone.ScaleExp;

  constructor(id: string, options?: ScaleExpModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._scaleNode = new Tone.ScaleExp(this._options.min, this._options.max);

    this._outputs = [new ModuleOutput("scale-signal-output", this._scaleNode)];
    this._inputs = [
      new ModuleInput("scale-signal-input", this._scaleNode)
    ];
  }

  get type(): AudioModuleType {
    return "scale-exp";
  }

  updateOptions(options: Partial<ScaleExpModuleOptions>): void {
    if (options.min !== undefined) {
      this._scaleNode.min = options.min;
    }
    if (options.max !== undefined) {
      this._scaleNode.max = options.max;
    }
  }


  dispose(): void {
    this._scaleNode.dispose();
  }
}
