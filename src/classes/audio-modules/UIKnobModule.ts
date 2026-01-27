import AudioModule, {
  type AudioModuleType,
} from "@/classes/audio-modules/AudioModule";
import * as Tone from "tone";
import ModuleOutput from "../ModuleOutput";

type UIKnobModuleOptions = {
  min: number;
  max: number;
  value: number;
};

const getDefaultOptions = (): UIKnobModuleOptions => ({
  min: 0,
  max: 1,
  value: 0,
});

export default class UIKnobModule extends AudioModule<UIKnobModuleOptions> {
  private _signal: Tone.Signal;

  constructor(id: string, options?: UIKnobModuleOptions) {
    super(id, options ?? getDefaultOptions());
    this._signal = new Tone.Signal(this._options.value);

    this._outputs = [new ModuleOutput("signal-output", this._signal)];
  }

  get type(): AudioModuleType {
    return "ui-knob";
  }

  updateOptions(options: Partial<UIKnobModuleOptions>): void {
    if (options.min !== undefined) {
      this._options.min = options.min;
    }
    if (options.max !== undefined) {
      this._options.max = options.max;
    }
    if (options.value !== undefined) {
      this._options.value = options.value;
      this._signal.linearRampTo(options.value, 0.01);
    }
  }

  dispose(): void {
    this._signal.dispose();
  }
}
