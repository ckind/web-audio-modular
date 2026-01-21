import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes/ModuleInput.ts";
import * as Tone from "tone";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import type { MessageBusDataType } from "@/types/connectionTypes";
import MessageOutputNode from "@/classes/MessageOutputNode";

type MidiCCToSignalModuleOptions = {
  channel: number;
  control: number;
  listenForChannelAndControl: boolean;
};

const getDefaultOptions = (): MidiCCToSignalModuleOptions => ({
  channel: 0,
  control: 0,
  listenForChannelAndControl: false,
});

export default class MidiCCToSignalModule extends AudioModule<MidiCCToSignalModuleOptions> {
  private _signal: Tone.Signal;
  private _outputMessageNode: MessageOutputNode;

  constructor(id: string, options?: MidiCCToSignalModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._signal = new Tone.Signal(0);
    this._outputMessageNode = new MessageOutputNode();

    this._inputs = [
      new ModuleInput(
        "midi-input",
        new MessageInputNode((time, data) => this._messageCallback(time, data)),
      ),
    ];
    this._outputs = [
      new ModuleOutput("signal-output", this._signal),
      new ModuleOutput("message-output", this._outputMessageNode),
    ];
  }

  get type(): AudioModuleType {
    return "midi-cc";
  }

  private _messageCallback(time: number, data?: MessageBusDataType): void {
    if (!data || !(data instanceof Uint8Array) || data.length < 3) {
      return;
    }

    if (this._options.listenForChannelAndControl) {
      this._options.channel = data[0]! & 0x0f; // Extract channel from MIDI status byte
      this._options.control = data[1]!; // Control number is the first parameter
      this._options.listenForChannelAndControl = false; // Stop listening after capturing the first message
      if (this.updateUIInstanceOptions) {
        this.updateUIInstanceOptions(this._options);
      }
      return;
    }

    if (
      (data[0]! & 0xf0) === 0xb0 && // Control Change message
      (data[0]! & 0x0f) === this._options.channel && // check for the specified channel
      data[1]! === this._options.control // check for matching control number
    ) {
      const num = data[2]!; // Control value (0-127)
      this._signal.setValueAtTime(num, time);
      this._outputMessageNode.scheduleMessage(time, num);
    }
  }

  updateOptions(options: Partial<MidiCCToSignalModuleOptions>): void {
    if (options.channel !== undefined) {
      this._options.channel = options.channel;
    }
    if (options.control !== undefined) {
      this._options.control = options.control;
    }
    if (options.listenForChannelAndControl !== undefined) {
      this._options.listenForChannelAndControl =
        options.listenForChannelAndControl;
    }
  }

  dispose(): void {
    this._signal.dispose();
  }
}
