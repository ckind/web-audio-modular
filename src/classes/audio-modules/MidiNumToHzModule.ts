import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes/ModuleInput.ts";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

type MidiNumToHzModuleOptions = {};

const getDefaultOptions = (): MidiNumToHzModuleOptions => ({});

export default class MidiNumToHzModule extends AudioModule<MidiNumToHzModuleOptions> {
  private _signal: Tone.Signal;
  private _tuningA4: number = 440; // A4 frequency

  constructor(id: string, options?: MidiNumToHzModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._signal = new Tone.Signal(0);

    this._inputs = [
      new ModuleInput(
        "midi-note-num",
        new MessageInputNode((time, data) =>
          this._messageCallback(time, data),
        ),
      ),
    ];

    this._outputs = [new ModuleOutput("frequency-output", this._signal)];
  }

  get type(): AudioModuleType {
    return "midi-num-to-hz";
  }

  private _messageCallback(time: number, data?: MessageBusDataType): void {
    if (!data || typeof data !== "number") {
      return;
    }

    const frequency = this._tuningA4 * Math.pow(2, (data - 69) / 12);
    this._signal.setValueAtTime(frequency, time);
  }

  updateOptions(options: Partial<MidiNumToHzModuleOptions>): void {}

  dispose(): void {}
}
