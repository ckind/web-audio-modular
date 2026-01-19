import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes/ModuleInput.ts";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import MessageOutputNode from "@/classes/MessageOutputNode";
import * as Tone from "tone";

type MidiNoteMessageModuleOptions = {
  channel: number;
  listenForChannel: boolean;
};

const getDefaultOptions = (): MidiNoteMessageModuleOptions => ({
  channel: 0,
  listenForChannel: false,
});

export default class MidiNoteMessageModule extends AudioModule<MidiNoteMessageModuleOptions> {
  private _noteOnNoteMessageNode: MessageOutputNode;
  private _noteOnVelocityMessageNode: MessageOutputNode;
  private _noteOffMessageNode: MessageOutputNode;
  private _sustainPedalDown: boolean = false;
  private _notesDown: Set<number> = new Set();

  constructor(id: string, options?: MidiNoteMessageModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._inputs = [
      new ModuleInput(
        "midi-input",
        new MessageInputNode((time, message) =>
          this._messageCallback(time, message),
        ),
      ),
    ];
    this._noteOnNoteMessageNode = new MessageOutputNode();
    this._noteOnVelocityMessageNode = new MessageOutputNode();
    this._noteOffMessageNode = new MessageOutputNode();
    this._outputs = [
      new ModuleOutput("note-on-note", this._noteOnNoteMessageNode),
      new ModuleOutput("note-on-velocity", this._noteOnVelocityMessageNode),
      new ModuleOutput("note-off-note", this._noteOffMessageNode),
    ];
  }

  get type(): AudioModuleType {
    return "midi-note-message";
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
      this._notesDown.add(noteNumber);
      this._forwardNoteOn(noteNumber, velocity);
    } else if (
      !this._sustainPedalDown && // if sustain pedal is down, ignore note off messages
      (message[0]! & 0xf0) === 0x80 && // note off message
      (message[0]! & 0x0f) === this._options.channel // check for the specified channel
    ) {
      const noteNumber = message[1]!; // MIDI note number (0-127)
      this._notesDown.delete(noteNumber);
      this._forwardNoteOff(noteNumber);
    } else if ((message[0]! & 0xf0) === 0xb0 && message[1]! === 64) {
      const sustainOn = message[2]! >= 64;
      if (sustainOn) {
        this._sustainPedalDown = true;
      } else {
        this._sustainPedalDown = false;
        // When the sustain pedal is released, send note off messages for any notes that are still marked as down
        this._notesDown.forEach((noteNumber) => {
          this._forwardNoteOff(noteNumber);
        });
        this._notesDown.clear();
      }
    }
  }

  private _forwardNoteOn(noteNumber: number, velocity: number) {
    const now = Tone.now();
    this._noteOnNoteMessageNode.scheduleMessage(now, noteNumber);
    this._noteOnVelocityMessageNode.scheduleMessage(now, velocity);
  }

  private _forwardNoteOff(noteNumber: number) {
    const now = Tone.now();
    this._noteOffMessageNode.scheduleMessage(now, noteNumber);
  }

  updateOptions(options: Partial<MidiNoteMessageModuleOptions>): void {
    if (options.channel !== undefined) {
      this._options.channel = options.channel;
    }
    if (options.listenForChannel !== undefined) {
      this._options.listenForChannel = options.listenForChannel;
    }
  }

  dispose(): void {}
}
