import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
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
    ];
  }

  get type(): AudioModuleType {
    return "oscillator";
  }

  updateOptions(options: Partial<OscillatorModuleOptions>): void {
    if (options.frequency !== undefined && options.frequency !== this._options.frequency) {
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
  }
}
