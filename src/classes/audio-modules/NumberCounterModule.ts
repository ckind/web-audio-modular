import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

type NumberCounterModuleOptions = {};

const getDefaultOptions = (): NumberCounterModuleOptions => ({});

export default class NumberCounterModule extends AudioModule<NumberCounterModuleOptions> {
  private _messageOutputNode: MessageOutputNode;
  private _incrementInputNode: MessageInputNode;
  private _setInputNode: MessageInputNode;
  private _count = 0;

  constructor(id: string, options?: NumberCounterModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._incrementInputNode = new MessageInputNode(
      this._incrementInputCallback.bind(this),
    );
    this._setInputNode = new MessageInputNode(
      this._setInputCallback.bind(this),
    );
    this._messageOutputNode = new MessageOutputNode();

    this._inputs = [
      new ModuleInput("increment", this._incrementInputNode),
      new ModuleInput("set", this._setInputNode)];
    this._outputs = [
      new ModuleOutput("counter-output", this._messageOutputNode),
    ];
  }

  get type(): AudioModuleType {
    return "num-counter";
  }

  private _incrementInputCallback(
    time: number,
    data?: MessageBusDataType,
  ): void {
    this._messageOutputNode.scheduleMessage(time, ++this._count);
  }

  private _setInputCallback(time: number, data?: MessageBusDataType): void {
    const num = Number(data);
    if (!isNaN(num)) {
      Tone.getTransport().schedule(() => (this._count = num), time);
    }
  }

  updateOptions(options: Partial<NumberCounterModuleOptions>): void {}

  dispose(): void {}
}
