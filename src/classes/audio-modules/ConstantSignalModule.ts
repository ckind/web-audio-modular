import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

type ConstantSignalModuleOptions = {
  value: number;
};

const getDefaultOptions = (): ConstantSignalModuleOptions => ({
  value: 1
});

export default class ConstantSignalModule extends AudioModule<ConstantSignalModuleOptions> {
  private _signal: Tone.Signal;

  constructor(id: string, options?: ConstantSignalModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._signal = new Tone.Signal(this._options.value);

    this._outputs = [
      new ModuleOutput("signal-output", this._signal),
    ];
  }

  get type(): AudioModuleType {
    return "constant-signal";
  }

  updateOptions(options: Partial<ConstantSignalModuleOptions>): void {
    if (options.value !== undefined) {
      this._signal.value = options.value;
      this._options.value = options.value;
    }
  }

  dispose(): void {
    this._signal.dispose();
  }
}
