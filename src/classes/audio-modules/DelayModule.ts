import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import * as Tone from "tone";

type DelayModuleOptions = {
  time: number;
};

const getDefaultOptions = (): DelayModuleOptions => ({
  time: 0.5,
});

export default class DelayModule extends AudioModule<DelayModuleOptions> {
  private _delayNode: Tone.Delay;

  constructor(id: string, options?: DelayModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._delayNode = new Tone.Delay();
    this._delayNode.delayTime.value = this._options.time; // Default delay time

    this._inputs = [
      new ModuleInput("input", this._delayNode),
      new ModuleInput("delay-time", this._delayNode.delayTime),
    ];
    this._outputs = [new ModuleOutput("output", this._delayNode)];
  }

  get type(): AudioModuleType {
    return "delay";
  }

  updateOptions(options: Partial<DelayModuleOptions>): void {
    if (options.time !== undefined) {
      this._delayNode.delayTime.value = options.time;
      this._options.time = options.time;
    }
  }

  dispose(): void {
    this._delayNode.dispose();
  }
}
