import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import * as Tone from "tone";
import ModuleOutput from "@/classes/ModuleOutput";
import { requestMidiDevices } from "@/helpers/midi";

export type MidiInputModuleOptions = {
  availableDevices: MIDIInput[];
  selectedDeviceId: string;
};

const getDefaultOptions = (): MidiInputModuleOptions => ({
  availableDevices: [],
  selectedDeviceId: "",
});

export default class MidiInputModule extends AudioModule<MidiInputModuleOptions> {
  private _messageOutput: MessageOutputNode;

  constructor(id: string, options?: MidiInputModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageOutput = new MessageOutputNode();
    this._outputs = [new ModuleOutput("midi-message", this._messageOutput)];
    requestMidiDevices().then((devices) => {
      this._options.availableDevices = devices;

      if (devices.length > 0) {
        this._options.selectedDeviceId = devices![0]!.id;
      }

      if (this.updateUIState) {
        this.updateUIState({ ...this._options });
      }
    });
  }

  get type(): AudioModuleType {
    return "midi-input";
  }

  updateOptions(options: Partial<MidiInputModuleOptions>): void {
    if (options.selectedDeviceId !== undefined) {
      this._options.selectedDeviceId = options.selectedDeviceId;
      this._options.availableDevices.forEach((device) => {
        if (device.id === options.selectedDeviceId) {
          device.onmidimessage = this.onMidiMessage.bind(this);
        } else {
          device.onmidimessage = null;
        }
      });
    }
    // Note: we don't update availableDevices here since it's managed internally by the module
    // if (options.availableDevices !== undefined) {
    //   this._options.availableDevices = options.availableDevices;
    // }
  }

  onMidiMessage(event: MIDIMessageEvent) {
    // Tone.js applies a lookahead to scheduled events that introduces latency,
    // but ensures accurate timing. For user input events like MIDI, we can schedule
    // them immediately to minimize latency (at the cost of perfect timing).
    this._messageOutput.scheduleMessage(Tone.immediate(), event.data);
  }

  dispose(): void {}
}
