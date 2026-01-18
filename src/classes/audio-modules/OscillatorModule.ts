import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";

type OscillatorModuleOptions = {
  frequency: number;
  type: OscillatorType;
};

const getDefaultOptions = (): OscillatorModuleOptions => ({
  frequency: 440,
  type: "sine",
});

export default class OscillatorModule extends AudioModule<OscillatorModuleOptions> {
  private _oscillatorNode: Tone.Oscillator;
  private _frequencyInput: Tone.Gain;

  constructor(id: string, options?: OscillatorModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._oscillatorNode = new Tone.Oscillator(
      this._options.frequency,
      this._options.type,
    );
    this._oscillatorNode.start();

    // inputs are summed
    this._frequencyInput = new Tone.Gain(1);
    this._frequencyInput.connect(this._oscillatorNode.frequency);

    this._outputs = [
      new ModuleOutput("osc-signal-output", this._oscillatorNode),
    ];
    this._inputs = [
      new ModuleInput("frequency-param", this._frequencyInput),
      new ModuleInput(
        "osc-type",
        new MessageInputNode(this.oscillatorTypeCallback.bind(this)),
      ),
    ];
  }

  get type(): AudioModuleType {
    return "oscillator";
  }

  oscillatorTypeCallback(time: number, data: any) {
    // todo: validate type?
    // seems like tone/web audio api is not actually able to change osc type
    // at a or k-rate
    this._oscillatorNode.type = data;
    this._options.type = data;
  }

  updateOptions(options: Partial<OscillatorModuleOptions>): void {
    if (
      options.frequency !== undefined &&
      options.frequency !== this._options.frequency
    ) {
      this._oscillatorNode.frequency.value = options.frequency;
      this._options.frequency = options.frequency;
    }
    if (options.type !== undefined && options.type !== this._options.type) {
      this._oscillatorNode.type = options.type;
      this._options.type = options.type;
    }
  }

  dispose(): void {
    this._oscillatorNode.stop();

    this._frequencyInput.disconnect();
    this._frequencyInput.dispose();

    this._oscillatorNode.disconnect();
    this._oscillatorNode.dispose();
  }
}
