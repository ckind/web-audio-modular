import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

export type MessageMultiplyModuleOptions = {
  multiplier: number;
};

const getDefaultOptions = (): MessageMultiplyModuleOptions => ({
  multiplier: 1,
});

export default class MessageMultiplyModule extends AudioModule<MessageMultiplyModuleOptions> {
  private _messageInputNode: MessageInputNode;
  private _messageOutputNode: MessageOutputNode;

  constructor(id: string, options?: MessageMultiplyModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageInputNode = new MessageInputNode(
      this._messageInputCallback.bind(this),
    );
    this._messageOutputNode = new MessageOutputNode();

    this._inputs = [new ModuleInput("input", this._messageInputNode)];
    this._outputs = [new ModuleOutput("output", this._messageOutputNode)];
  }

  get type(): AudioModuleType {
    return "msg-multiply";
  }

  private _messageInputCallback(time: number, data?: MessageBusDataType): void {
    const num = Number(data);
    if (!isNaN(num)) {
      this._messageOutputNode.scheduleMessage(
        time,
        num * this._options.multiplier,
      );
    }
  }

  updateOptions(options: Partial<MessageMultiplyModuleOptions>): void {
    if (options.multiplier !== undefined) {
      this._options.multiplier = options.multiplier;
    }
  }

  dispose(): void {}
}
