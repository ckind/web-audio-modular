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
  private _frequencySum: Tone.Add;

  constructor(id: string, options?: OscillatorModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._oscillatorNode = new Tone.Oscillator(
      this._options.frequency,
      this._options.type,
    );
    this._frequencySum = new Tone.Add(this._options.frequency);
    this._frequencySum.connect(this._oscillatorNode.frequency);
    this._oscillatorNode.start();

    this._outputs = [
      new ModuleOutput("osc-signal-output", this._oscillatorNode),
    ];
    // use an add node to sum multiple frequency inputs
    // this also fixes an issue with Tone Oscillators where the frequency
    // parameter isn't responsive after disconnecting all incoming signals from it
    this._inputs = [
      new ModuleInput("frequency-param", this._frequencySum),
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
    // todo: seems like tone/web audio api is not actually able to change
    this._oscillatorNode.type = data;
    this._options.type = data;
  }

  updateOptions(options: Partial<OscillatorModuleOptions>): void {
    if (
      options.frequency !== undefined &&
      options.frequency !== this._options.frequency
    ) {
      this._frequencySum.value = options.frequency;
      this._options.frequency = options.frequency;
    }
    if (options.type !== undefined && options.type !== this._options.type) {
      this._oscillatorNode.type = options.type;
      this._options.type = options.type;
    }
  }

  dispose(): void {
    this._oscillatorNode.stop();
    this._frequencySum.dispose();
    this._oscillatorNode.dispose();
  }
}
