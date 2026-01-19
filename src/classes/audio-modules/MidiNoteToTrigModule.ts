import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes/ModuleInput.ts";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import MessageOutputNode from "@/classes/MessageOutputNode";
import * as Tone from "tone";

type MidiNoteToTrigModuleOptions = {
  channel: number;
  listenForChannel: boolean;
};

const getDefaultOptions = (): MidiNoteToTrigModuleOptions => ({
  channel: 0,
  listenForChannel: false,
});

export default class MidiNoteToTrigModule extends AudioModule<MidiNoteToTrigModuleOptions> {
  private _noteOnMessageNode: MessageOutputNode;
  private _noteOffMessageNode: MessageOutputNode;
  private _noteNumberMessageNode: MessageOutputNode;

  constructor(id: string, options?: MidiNoteToTrigModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._inputs = [
      new ModuleInput(
        "midi-input",
        new MessageInputNode((time, message) =>
          this._messageCallback(time, message),
        ),
      ),
    ];
    this._noteOnMessageNode = new MessageOutputNode();
    this._noteOffMessageNode = new MessageOutputNode();
    this._noteNumberMessageNode = new MessageOutputNode();
    this._outputs = [
      new ModuleOutput("note-on", this._noteOnMessageNode),
      new ModuleOutput("note-off", this._noteOffMessageNode),
      new ModuleOutput("note-num", this._noteNumberMessageNode),
    ];
  }

  get type(): AudioModuleType {
    return "midi-note-to-trig";
  }

  private _messageCallback(time: number, message: Uint8Array) {
    if (this._options.listenForChannel) {
      this.options.channel = message[0]! & 0x0f; // Extract channel from MIDI status byte
      this.options.listenForChannel = false; // Stop listening after capturing the first message
      if (this.updateUIInstanceOptions) {
        this.updateUIInstanceOptions(this._options);
      }
      return;
    }

    if (
      (message[0]! & 0xf0) === 0x90 && // note on message
      (message[0]! & 0x0f) === this._options.channel // check for the specified channel
    ) {
      const noteNumber = message[1]!; // MIDI note number (0-127)
      const velocity = message[2]!; // MIDI velocity (0-127)
      this._forwardNoteOn(noteNumber, velocity);
    } else if (
      (message[0]! & 0xf0) === 0x80 && // note off message
      (message[0]! & 0x0f) === this._options.channel // check for the specified channel
    ) {
      const noteNumber = message[1]!; // MIDI note number (0-127)
      this._forwardNoteOff(noteNumber);
    }
  }

  private _forwardNoteOn(noteNumber: number, velocity: number) {
    const now = Tone.now();
    this._noteOnMessageNode.scheduleMessage(now, velocity);
    this._noteNumberMessageNode.scheduleMessage(now, noteNumber);
  }

  private _forwardNoteOff(noteNumber: number) {
    const now = Tone.now();
    this._noteOffMessageNode.scheduleMessage(now, 0);
    this._noteNumberMessageNode.scheduleMessage(now, noteNumber);
  }

  updateOptions(options: Partial<MidiNoteToTrigModuleOptions>): void {
    if (options.channel !== undefined) {
      this._options.channel = options.channel;
    }
    if (options.listenForChannel !== undefined) {
      this._options.listenForChannel = options.listenForChannel;
    }
  }

  dispose(): void {}
}
