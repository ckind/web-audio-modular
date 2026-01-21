import AudioModule, { type AudioModuleType } from "./AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import * as Tone from "tone";

type FxDelayOptions = {
  delayTime: number;
  feedback: number;
  mix: number;
};

const getDefaultOptions = (): FxDelayOptions => ({
  delayTime: 0.5,
  feedback: 0.3,
  mix: 0.5,
});

export default class FxDelayModule extends AudioModule<FxDelayOptions> {
  private _delay: Tone.FeedbackDelay;
  private _output: Tone.Gain;

  constructor(id: string, options?: FxDelayOptions) {
    super(id, options ?? getDefaultOptions());

    // Initialize nodes
    this._delay = new Tone.FeedbackDelay(this._options.delayTime, this._options.feedback);
    this._output = new Tone.Gain();

    // Connect input to delay
    this._delay.connect(this._output);

    // Set wet level (mix)
    this._delay.wet.value = this._options.mix;

    this._inputs = [
      new ModuleInput("signal", this._delay),
      new ModuleInput("delayTime", this._delay.delayTime),
      new ModuleInput("feedback", this._delay.feedback),
      new ModuleInput("mix", this._delay.wet),
    ];
    this._outputs = [new ModuleOutput("output", this._output)];
  }

  get type(): AudioModuleType {
    return "fx-delay";
  }

  updateOptions(options: Partial<FxDelayOptions>): void {
    if (options.delayTime !== undefined) {
      this._options.delayTime = options.delayTime;
      this._delay.delayTime.value = options.delayTime;
    }
    if (options.feedback !== undefined) {
      this._options.feedback = options.feedback;
      this._delay.feedback.value = options.feedback;
    }
    if (options.mix !== undefined) {
      this._options.mix = options.mix;
      this._delay.wet.value = options.mix;
    }
  }

  dispose(): void {
    this._delay.dispose();
    this._output.dispose();
  }
}
