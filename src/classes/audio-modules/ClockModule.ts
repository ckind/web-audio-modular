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

function bpmToHz(bpm: number): number {
  return bpm / 60;
}

export default class ClockModule extends AudioModule<ClockModuleOptions> {
  private _startStopInput: MessageInputNode;
  private _bpmInput: MessageInputNode;
  private _counter: number = 0;

  private _messageOutput: MessageOutputNode;

  private _clock: Tone.Clock;

  constructor(id: string, options?: ClockModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._clock = new Tone.Clock(
      this._clockCallback.bind(this),
      bpmToHz(this._options.bpm),
    );

    this._clock.start();

    this._startStopInput = new MessageInputNode(this.toggleRunning.bind(this));
    this._bpmInput = new MessageInputNode(this.bpmInputCallback.bind(this));

    this._messageOutput = new MessageOutputNode();
    this._outputs = [new ModuleOutput("clock-output", this._messageOutput)];
    this._inputs = [
      new ModuleInput("clock-start-stop", this._startStopInput),
      new ModuleInput("clock-bpm", this._bpmInput),
    ];
  }

  get type(): AudioModuleType {
    return "clock";
  }

  private _clockCallback(time: number) {
    this._counter++;
    this._messageOutput.scheduleMessage(time, this._counter);
  }

  updateOptions(options: Partial<ClockModuleOptions>): void {
    if (options.bpm !== undefined) {
      this._options.bpm = options.bpm;
      this._clock.frequency.value = bpmToHz(this._options.bpm);
    }
  }

  toggleRunning(time: number, data?: MessageBusDataType): void {
    if (this._clock.state === "stopped") {
      this._clock.start(time);
    } else {
      this._clock.stop(time);
    }
  }

  bpmInputCallback(time: number, data?: MessageBusDataType): void {
    if (typeof data !== "number") {
      return;
    }

    this._clock.frequency.value = bpmToHz(data);
  }

  dispose(): void {
    this._clock.stop();
    this._clock.dispose();
  }
}
