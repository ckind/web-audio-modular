import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import * as Tone from "tone";
import ScaleWorkletNode from "@/classes/audio-nodes/ScaleWorkletNode";

type ScaleModuleOptions = {
  inputMin: number;
  inputMax: number;
  outputMin: number;
  outputMax: number;
};

const getDefaultOptions = (): ScaleModuleOptions => ({
  inputMin: -1,
  inputMax: 1,
  outputMin: 0,
  outputMax: 1,
});

export default class ScaleModule extends AudioModule<ScaleModuleOptions> {
  private _scaleNode: ScaleWorkletNode;

  constructor(id: string, options?: ScaleModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._scaleNode = new ScaleWorkletNode({
      inputMin: this._options.inputMin,
      inputMax: this._options.inputMax,
      outputMin: this._options.outputMin,
      outputMax: this._options.outputMax,
    });

    this._outputs = [new ModuleOutput("scale-signal-output", this._scaleNode)];
    this._inputs = [new ModuleInput("scale-signal-input", this._scaleNode)];
  }

  get type(): AudioModuleType {
    return "scale";
  }

  updateOptions(options: Partial<ScaleModuleOptions>): void {
    if (options.inputMin !== undefined) {
      this._scaleNode.inputMin.value = options.inputMin;
      this._options.inputMin = options.inputMin;
    }
    if (options.inputMax !== undefined) {
      this._scaleNode.inputMax.value = options.inputMax;
      this._options.inputMax = options.inputMax;
    }
    if (options.outputMin !== undefined) {
      this._scaleNode.outputMin.value = options.outputMin;
      this._options.outputMin = options.outputMin;
    }
    if (options.outputMax !== undefined) {
      this._scaleNode.outputMax.value = options.outputMax;
      this._options.outputMax = options.outputMax;
    }
  }

  dispose(): void {
    this._scaleNode.dispose();
  }
}
