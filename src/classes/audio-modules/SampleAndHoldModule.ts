import AudioModule, { type AudioModuleType } from "./AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";

type SampleAndHoldOptions = {
  // Add options as needed
};

const getDefaultOptions = (): SampleAndHoldOptions => ({});

export default class SampleAndHoldModule extends AudioModule<SampleAndHoldOptions> {
  private _outputSignal: Tone.Signal;
  private _triggerInputNode: MessageInputNode;
  private _meter: Tone.DCMeter;

  constructor(id: string, options?: SampleAndHoldOptions) {
    super(id, options ?? getDefaultOptions());

    this._meter = new Tone.DCMeter();
    this._outputSignal = new Tone.Signal(0);

    this._triggerInputNode = new MessageInputNode(this._sampleAndHold.bind(this));

    this._inputs = [
      new ModuleInput("signal", this._meter),
      new ModuleInput("trigger", this._triggerInputNode),
    ];
    this._outputs = [new ModuleOutput("output", this._outputSignal)];
  }

  private _sampleAndHold(): void {
    // Set the output signal to the current sampled value
    this._outputSignal.setValueAtTime(this._meter.getValue(), Tone.now());
  }

  get type(): AudioModuleType {
    return "sample-and-hold";
  }

  updateOptions(options: Partial<SampleAndHoldOptions>): void {
    this._options = { ...this._options, ...options };
  }

  dispose(): void {
    this._meter.dispose();
    this._outputSignal.dispose();
  }
}
