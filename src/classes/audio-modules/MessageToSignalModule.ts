import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes/ModuleInput.ts";
import * as Tone from "tone";
import MessageInputNode from "../MessageInputNode";
import ModuleOutput from "../ModuleOutput";

type MessageToSignalModuleOptions = {};

const getDefaultOptions = (): MessageToSignalModuleOptions => ({});

export default class MessageToSignalModule extends AudioModule<MessageToSignalModuleOptions> {
  private _signal: Tone.Signal;

  constructor(
    id: string,
    options?: MessageToSignalModuleOptions
  ) {
    super(id, options ?? getDefaultOptions());

    this._signal = new Tone.Signal(0);
    this._inputs = [new ModuleInput("message-input", new MessageInputNode(
      (time, message) => this._messageCallback(time, message)
    ))];
    this._outputs = [new ModuleOutput("signal-output", this._signal)];
  }

  get type(): AudioModuleType {
    return "message-to-signal";
  }

  private _messageCallback(time: number, message: any) {
    const num = Number(message);
    if (!isNaN(num)) {
      this._signal.setValueAtTime(num, time);
    } else {
      console.warn("Received message with non-numeric value for message to signal module:", message);
    }
  }

  updateOptions(options: Partial<MessageToSignalModuleOptions>): void {
    // No options to update for message to signal module
  }

  dispose(): void {
    this._signal.dispose();
  }
}
