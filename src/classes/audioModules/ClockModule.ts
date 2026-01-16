import AudioModule from "@/classes/audioModules/AudioModule";
import type { AudioModuleType } from "@/classes/factory/AudioModuleFactory";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import TickSourceNode from "../TickSourceNode";

type ClockModuleOptions = {
  bpm: number;
};

const getDefaultOptions = (): ClockModuleOptions => ({
  bpm: 120,
});


export default class ClockModule extends AudioModule<ClockModuleOptions> {
  private _tickSourceNode: TickSourceNode;

  constructor(id: string, ctx: AudioContext, options?: ClockModuleOptions) {
    super(id, ctx, options ?? getDefaultOptions());
    
    this._tickSourceNode = new TickSourceNode(ctx);

    this._outputs = [new ModuleOutput("clock-tick-output", this._tickSourceNode)];
  }

  get type(): AudioModuleType {
    return "clock";
  }

  updateOptions(options: Partial<ClockModuleOptions>): void {
    if (options.bpm !== undefined) {
      this._options.bpm = options.bpm;
    }
  }

  dispose(): void {}
}