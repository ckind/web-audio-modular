import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import PowCurveWorkletNode from "@/classes/audio-nodes/PowCurveWorkletNode";

type PowCurveModuleOptions = {
  min: number;
  max: number;
  base: number;
};

const getDefaultOptions = (): PowCurveModuleOptions => ({
  min: 20,
  max: 20000,
  base: 2,
});

export default class PowCurveModule extends AudioModule<PowCurveModuleOptions> {
  private _powCurveNode: PowCurveWorkletNode;

  constructor(id: string, options?: PowCurveModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._powCurveNode = new PowCurveWorkletNode({
      min: this._options.min,
      max: this._options.max,
      base: this._options.base,
    });

    this._outputs = [new ModuleOutput("pow-curve-signal-output", this._powCurveNode)];
    this._inputs = [new ModuleInput("pow-curve-signal-input", this._powCurveNode)];
  }

  get type(): AudioModuleType {
    return "pow-curve";
  }

  updateOptions(options: Partial<PowCurveModuleOptions>): void {
    if (options.min !== undefined) {
      this._powCurveNode.min.value = options.min;
      this._options.min = options.min;
    }
    if (options.max !== undefined) {
      this._powCurveNode.max.value = options.max;
      this._options.max = options.max;
    }
    if (options.base !== undefined) {
      this._powCurveNode.base.value = options.base;
      this._options.base = options.base;
    }
  }

  dispose(): void {
    this._powCurveNode.dispose();
  }
}
