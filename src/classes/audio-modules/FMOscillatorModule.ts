import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import type { ToneOscillatorType } from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

type FMOscillatorModuleOptions = {
  frequency: number;
  ratio: number;
  carrierType: ToneOscillatorType;
  modulatorType: ToneOscillatorType;
  modulationAmount: number;
};

const getDefaultOptions = (): FMOscillatorModuleOptions => ({
  frequency: 440,
  ratio: 1,
  carrierType: "sine",
  modulatorType: "sine",
  modulationAmount: 0,
});

export default class FMOscillatorModule extends AudioModule<FMOscillatorModuleOptions> {
  private _oscillatorNode: Tone.FMOscillator;
  private _frequencyInput: Tone.Gain;

  constructor(id: string, options?: FMOscillatorModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._oscillatorNode = new Tone.FMOscillator(
      this._options.frequency,
      this._options.carrierType,
      this._options.modulatorType,
    );
    this._oscillatorNode.harmonicity.value = this._options.ratio;
    this._oscillatorNode.modulationIndex.value = this._options.modulationAmount;
    this._oscillatorNode.start();

    // inputs are summed
    this._frequencyInput = new Tone.Gain(1);
    this._frequencyInput.connect(this._oscillatorNode.frequency);

    this._outputs = [
      new ModuleOutput("osc-signal-output", this._oscillatorNode),
    ];
    this._inputs = [
      new ModuleInput("carrier-frequency", this._frequencyInput),
      // new ModuleInput("carrier-type", this._oo),
      new ModuleInput("ratio", this._oscillatorNode.harmonicity),
      // new ModuleInput("modulator-type", this._frequencyInput),
      new ModuleInput(
        "modulation-amount",
        this._oscillatorNode.modulationIndex,
      ),
    ];
  }

  get type(): AudioModuleType {
    return "osc-fm";
  }

  updateOptions(options: Partial<FMOscillatorModuleOptions>): void {
    if (options.frequency !== undefined) {
      this._oscillatorNode.frequency.value = options.frequency;
      this._options.frequency = options.frequency;
    }
    if (options.carrierType !== undefined) {
      this._oscillatorNode.type = options.carrierType;
      this._options.carrierType = options.carrierType;
    }
    if (options.modulatorType !== undefined) {
      this._oscillatorNode.modulationType = options.modulatorType;
      this._options.modulatorType = options.modulatorType;
    }
    if (options.modulationAmount !== undefined) {
      this._oscillatorNode.modulationIndex.value = options.modulationAmount;
      this._options.modulationAmount = options.modulationAmount;
    }
    if (options.ratio !== undefined) {
      this._oscillatorNode.harmonicity.value = options.ratio;
      this._options.ratio = options.ratio;
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
