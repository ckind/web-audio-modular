import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import * as Tone from "tone";

type UISwitchModuleOptions = {
  channel: number;
};

const getDefaultOptions = (): UISwitchModuleOptions => ({
  channel: 1,
});

export default class UISwitchModule extends AudioModule<UISwitchModuleOptions> {
  private _channelGains: Tone.Gain[];
  private _outputGain: Tone.Gain;

  constructor(id: string, options?: UISwitchModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._outputGain = new Tone.Gain(1);
    this._channelGains = [
      new Tone.Gain(this._options.channel === 1 ? 1 : 0),
      new Tone.Gain(this._options.channel === 2 ? 1 : 0),
    ];
    this._channelGains.forEach((g) => g.connect(this._outputGain));

    this._inputs = [
      new ModuleInput("channel-1", this._channelGains[0]!),
      new ModuleInput("channel-2", this._channelGains[1]!),
    ];
    this._outputs = [new ModuleOutput("output", this._outputGain)];
  }

  get type(): AudioModuleType {
    return "ui-switch";
  }

  updateOptions(options: Partial<UISwitchModuleOptions>): void {
    if (options.channel !== undefined) {
      if (options.channel === 1) {
        this._channelGains[1]!.gain.value = 0;
        this._channelGains[0]!.gain.value = 1;
      } else if (options.channel === 2) {
        this._channelGains[0]!.gain.value = 0;
        this._channelGains[1]!.gain.value = 1;
      }
      this._options.channel = options.channel;
    }
  }

  dispose(): void {
    this._channelGains.forEach((g) => g.dispose());
    this._outputGain.dispose();
  }
}
