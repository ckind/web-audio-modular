import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes/ModuleInput.ts";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import MessageOutputNode from "@/classes/MessageOutputNode";
import type { MessageBusDataType } from "@/types/connectionTypes";

export type MidiNoteMessageModuleOptions = {
  channel: number;
  listenForChannel: boolean;
};

export type MidiNoteMessageGUIState = {
  listening: boolean;
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
        new MessageInputNode((time, data) => this._messageCallback(time, data)),
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

  private _messageCallback(time: number, data?: MessageBusDataType): void {
    if (!data || !(data instanceof Uint8Array) || data.length < 3) {
      return;
    }

    if (this._options.listenForChannel) {
      this._options.channel = data[0]! & 0x0f; // Extract channel from MIDI status byte
      this._options.listenForChannel = false; // Stop listening after capturing the first message
      if (this.updateUIState) {
        this.updateUIState({ ...this._options }, { listening: false });
      }
      return;
    }

    if (
      (data[0]! & 0xf0) === 0x90 && // note on message
      (data[0]! & 0x0f) === this._options.channel // check for the specified channel
    ) {
      const noteNumber = data[1]!; // MIDI note number (0-127)
      const velocity = data[2]!; // MIDI velocity (0-127)
      this._notesDown.add(noteNumber);
      this._forwardNoteOn(time, noteNumber, velocity);
    } else if (
      !this._sustainPedalDown && // if sustain pedal is down, ignore note off messages
      (data[0]! & 0xf0) === 0x80 && // note off message
      (data[0]! & 0x0f) === this._options.channel // check for the specified channel
    ) {
      const noteNumber = data[1]!; // MIDI note number (0-127)
      this._notesDown.delete(noteNumber);
      this._forwardNoteOff(time, noteNumber);
    } else if ((data[0]! & 0xf0) === 0xb0 && data[1]! === 64) {
      const sustainOn = data[2]! >= 64;
      if (sustainOn) {
        this._sustainPedalDown = true;
      } else {
        this._sustainPedalDown = false;
        // When the sustain pedal is released, send note off messages for any notes that are still marked as down
        this._notesDown.forEach((noteNumber) => {
          this._forwardNoteOff(time, noteNumber);
        });
        this._notesDown.clear();
      }
    }
  }

  private _forwardNoteOn(time: number, noteNumber: number, velocity: number) {
    this._noteOnNoteMessageNode.scheduleMessage(time, noteNumber);
    this._noteOnVelocityMessageNode.scheduleMessage(time, velocity);
  }

  private _forwardNoteOff(time: number, noteNumber: number) {
    this._noteOffMessageNode.scheduleMessage(time, noteNumber);
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
