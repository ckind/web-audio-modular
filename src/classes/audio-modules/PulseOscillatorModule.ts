import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

type PulseOscillatorModuleOptions = {
  frequency: number;
  width: number;
};

const getDefaultOptions = (): PulseOscillatorModuleOptions => ({
  frequency: 440,
  width: 0.5,
});

export default class PulseOscillatorModule extends AudioModule<PulseOscillatorModuleOptions> {
  private _oscillatorNode: Tone.PulseOscillator;

  constructor(id: string, options?: PulseOscillatorModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._oscillatorNode = new Tone.PulseOscillator(this._options.frequency);
    this._oscillatorNode.start();

    this._outputs = [new ModuleOutput("output", this._oscillatorNode)];
    this._inputs = [
      new ModuleInput("frequency-param", this._oscillatorNode.frequency),
      new ModuleInput("pulse-width-param", this._oscillatorNode.width),
    ];
  }

  get type(): AudioModuleType {
    return "osc-pulse";
  }

  updateOptions(options: Partial<PulseOscillatorModuleOptions>): void {
    if (options.frequency !== undefined) {
      this._oscillatorNode.frequency.value = options.frequency;
      this._options.frequency = options.frequency;
    }
    if (options.width !== undefined) {
      this._oscillatorNode.width.value = options.width;
      this._options.width = options.width;
    }
  }

  dispose(): void {
    this._oscillatorNode.stop();
    this._oscillatorNode.disconnect();
    this._oscillatorNode.dispose();
  }
}
