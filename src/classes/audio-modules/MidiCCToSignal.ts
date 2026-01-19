import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes/ModuleInput.ts";
import * as Tone from "tone";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";

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

  constructor(id: string, options?: MidiCCToSignalModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._signal = new Tone.Signal(0);
    this._inputs = [
      new ModuleInput(
        "midi-input",
        new MessageInputNode((time, message) =>
          this._messageCallback(time, message),
        ),
      ),
    ];
    this._outputs = [new ModuleOutput("signal-output", this._signal)];
  }

  get type(): AudioModuleType {
    return "midi-cc-to-signal";
  }

  private _messageCallback(time: number, message: Uint8Array) {
    if (this._options.listenForChannelAndControl) {
      this.options.channel = message[0]! & 0x0f; // Extract channel from MIDI status byte
      this.options.control = message[1]!; // Control number is the first parameter
      this.options.listenForChannelAndControl = false; // Stop listening after capturing the first message
      if (this.updateUIInstanceOptions) {
        this.updateUIInstanceOptions(this._options);
      }
      return;
    }

    if (
      (message[0]! & 0xf0) === 0xb0 && // Control Change message
      (message[0]! & 0x0f) === this._options.channel && // check for the specified channel
      message[1]! === this._options.control // check for matching control number
    ) {
      const num = message[2]!; // Control value (0-127)
      this._signal.setValueAtTime(num, time);
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
