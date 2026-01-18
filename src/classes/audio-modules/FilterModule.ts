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
  frequency: 350,
  type: "lowpass",
  resonance: 1
});

export default class FilterModule extends AudioModule<FilterModuleOptions> {
  private _filterNode: Tone.Filter;

  constructor(id: string, options?: FilterModuleOptions) {
    super(id, options ?? getDefaultOptions());
    
    this._filterNode = new Tone.Filter();
    this._filterNode.frequency.value = this._options.frequency;
    this._filterNode.type = this._options.type;
    this._filterNode.Q.value = this._options.resonance;

    this._outputs = [new ModuleOutput("filter-signal-output", this._filterNode)];
    this._inputs = [
      new ModuleInput("filter-signal-input", this._filterNode),
      new ModuleInput("filter-frequency-param", this._filterNode.frequency),
      new ModuleInput("filter-resonance-param", this._filterNode.Q),
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
    this._filterNode.dispose();
  }
}
