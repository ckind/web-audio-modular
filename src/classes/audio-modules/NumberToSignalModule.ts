import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes/ModuleInput.ts";
import * as Tone from "tone";
import MessageInputNode from "../MessageInputNode";
import ModuleOutput from "../ModuleOutput";
import type { MessageBusDataType } from "@/types/connectionTypes";

type NumberToSignalModuleOptions = {};

const getDefaultOptions = (): NumberToSignalModuleOptions => ({});

export default class NumberToSignalModule extends AudioModule<NumberToSignalModuleOptions> {
  private _signal: Tone.Signal;

  constructor(
    id: string,
    options?: NumberToSignalModuleOptions
  ) {
    super(id, options ?? getDefaultOptions());

    this._signal = new Tone.Signal(0);
    this._inputs = [new ModuleInput("message-input", new MessageInputNode(
      (time, data) => this._messageCallback(time, data)
    ))];
    this._outputs = [new ModuleOutput("signal-output", this._signal)];
  }

  get type(): AudioModuleType {
    return "num-to-signal";
  }

  private _messageCallback(time: number, data?: MessageBusDataType) {
    const num = Number(data);
    if (!isNaN(num)) {
      this._signal.setValueAtTime(num, time);
    } else {
      console.warn("Received message with non-numeric value for message to signal module:", data);
    }
  }

  updateOptions(options: Partial<NumberToSignalModuleOptions>): void {
    // No options to update for message to signal module
  }

  dispose(): void {
    this._signal.dispose();
  }
}
