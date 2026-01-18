import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import * as Tone from "tone";

type FilterModuleOptions = {
  frequency: number;
  type: BiquadFilterType;
  resonance: number
};

const getDefaultOptions = (): FilterModuleOptions => ({
  frequency: 800,
  type: "lowpass",
  resonance: 1
});

export default class FilterModule extends AudioModule<FilterModuleOptions> {
  private _filterNode: Tone.Filter;
  private _frequencyInput: Tone.Gain;
  private _resonanceInput: Tone.Gain;

  constructor(id: string, options?: FilterModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._frequencyInput = new Tone.Gain(1);
    this._resonanceInput = new Tone.Gain(1);
    
    this._filterNode = new Tone.Filter();
    this._filterNode.frequency.value = this._options.frequency;
    this._filterNode.type = this._options.type;
    this._filterNode.Q.value = this._options.resonance;

    this._frequencyInput.connect(this._filterNode.frequency);
    this._resonanceInput.connect(this._filterNode.Q);

    this._outputs = [new ModuleOutput("filter-signal-output", this._filterNode)];
    this._inputs = [
      new ModuleInput("filter-signal-input", this._filterNode),
      new ModuleInput("filter-frequency-param", this._frequencyInput),
      new ModuleInput("filter-resonance-param", this._resonanceInput),
    ];
  }

  get type(): AudioModuleType {
    return "filter";
  }

  updateOptions(options: Partial<FilterModuleOptions>): void {
    if (options.frequency !== undefined) {
      this._filterNode.frequency.value = options.frequency;
      this._options.frequency = options.frequency;
    }
    if (options.type !== undefined) {
      this._filterNode.type = options.type;
      this._options.type = options.type;
    }
    if (options.resonance !== undefined) {
      this._filterNode.Q.value = options.resonance;
      this._options.resonance = options.resonance;
    }
  }

  dispose(): void {
    this._frequencyInput.disconnect();
    this._frequencyInput.dispose();
    this._resonanceInput.disconnect();
    this._resonanceInput.dispose();
    this._filterNode.disconnect();
    this._filterNode.dispose();
  }
}
