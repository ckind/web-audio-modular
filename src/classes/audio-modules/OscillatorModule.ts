import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

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

  constructor(id: string, options?: OscillatorModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._oscillatorNode = new Tone.Oscillator(
      this._options.frequency,
      this._options.type,
    );
    this._oscillatorNode.start();


    this._outputs = [
      new ModuleOutput("osc-signal-output", this._oscillatorNode),
    ];
    this._inputs = [
      new ModuleInput("frequency-param", this._oscillatorNode.frequency),
      new ModuleInput(
        "osc-type",
        new MessageInputNode(this.oscillatorTypeCallback.bind(this)),
      ),
    ];
  }

  get type(): AudioModuleType {
    return "osc";
  }

  oscillatorTypeCallback(time: number, data?: MessageBusDataType): void {
    if (!data || typeof data !== "string") {
      return;
    }

    // seems like tone/web audio api is not actually able to change osc type
    // at a or k-rate
    this._oscillatorNode.type = data as OscillatorType;
    this._options.type = data as OscillatorType;
  }

  updateOptions(options: Partial<OscillatorModuleOptions>): void {
    if (options.frequency !== undefined) {
      this._oscillatorNode.frequency.value = options.frequency;
      this._options.frequency = options.frequency;
    }
    if (options.type !== undefined) {
      this._oscillatorNode.type = options.type;
      this._options.type = options.type;
    }
  }

  dispose(): void {
    this._oscillatorNode.stop();

    this._oscillatorNode.disconnect();
    this._oscillatorNode.dispose();
  }
}
