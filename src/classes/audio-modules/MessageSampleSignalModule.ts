import AudioModule, { type AudioModuleType } from "./AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import MessageOutputNode from "@/classes/MessageOutputNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

type MessageSampleSignalOptions = {
  // Add options as needed
};

const getDefaultOptions = (): MessageSampleSignalOptions => ({});

export default class MessageSampleSignalModule extends AudioModule<MessageSampleSignalOptions> {
  private _messageOutputNode: MessageOutputNode;
  private _triggerInputNode: MessageInputNode;
  private _meter: Tone.DCMeter;

  constructor(id: string, options?: MessageSampleSignalOptions) {
    super(id, options ?? getDefaultOptions());

    this._meter = new Tone.DCMeter();

    this._triggerInputNode = new MessageInputNode(this._sampleSignal.bind(this));
    this._messageOutputNode = new MessageOutputNode();

    this._inputs = [
      new ModuleInput("signal", this._meter),
      new ModuleInput("trigger", this._triggerInputNode),
    ];
    this._outputs = [new ModuleOutput("sampled", this._messageOutputNode)];
  }

  private _sampleSignal(time: number, data?: MessageBusDataType): void {
    // Send the current signal value as a message
    // todo: issues with precise timing here? how to pass time info to meter?
    this._messageOutputNode.scheduleMessage(time, this._meter.getValue());
  }

  get type(): AudioModuleType {
    return "msg-sample";
  }

  updateOptions(options: Partial<MessageSampleSignalOptions>): void {
    this._options = { ...this._options, ...options };
  }

  dispose(): void {
    this._meter.dispose();
  }
}
