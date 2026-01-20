import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageInputNode from "@/classes/MessageInputNode";
import MessageOutputNode from "@/classes/MessageOutputNode";
import * as Tone from "tone";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "@/classes/ModuleInput";
import type { MessageBusDataType } from "@/types/connectionTypes";

type ClockModuleOptions = {
  bpm: number;
};

const getDefaultOptions = (): ClockModuleOptions => ({
  bpm: 120,
});

export default class ClockModule extends AudioModule<ClockModuleOptions> {
  private _intervalSeconds: number;
  private _running: boolean = false;
  private _eventId: number;
  private _counter: number = 0;

  private _messageOutput: MessageOutputNode;

  constructor(id: string, options?: ClockModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._intervalSeconds = 60 / this._options.bpm;
    this._eventId = Tone.getTransport().scheduleRepeat(
      (time: number) => this._clockCallback(time),
      this._intervalSeconds,
    );

    this._messageOutput = new MessageOutputNode();
    this._outputs = [new ModuleOutput("clock-output", this._messageOutput)];
    this._inputs = [
      new ModuleInput(
        "clock-start-stop",
        new MessageInputNode((time, data) => {
          this.toggleRunning(time, data);
        }),
      ),
    ];

    this._running = true;
  }

  get type(): AudioModuleType {
    return "clock";
  }

  private _clockCallback(time: number) {
    if (this._running) {
      this._counter++;
      this._messageOutput.scheduleMessage(time, this._counter);
    }
  }

  updateOptions(options: Partial<ClockModuleOptions>): void {
    if (options.bpm !== undefined) {
      this._options.bpm = options.bpm;
      this._intervalSeconds = 60 / this._options.bpm;
      // rescheduled repeated event
      // todo: sample accurate way to do this?
      Tone.getTransport().clear(this._eventId);
      this._eventId = Tone.getTransport().scheduleRepeat(
        (time: number) => this._clockCallback(time),
        this._intervalSeconds,
      );
    }
  }

  toggleRunning(time: number, data?: MessageBusDataType): void {
    this._running = !this._running;
  }

  dispose(): void {
    Tone.getTransport().clear(this._eventId);
  }
}
