import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

export type MessageAddModuleOptions = {
  addValue: number;
};

const getDefaultOptions = (): MessageAddModuleOptions => ({
  addValue: 0,
});

export default class MessageAddModule extends AudioModule<MessageAddModuleOptions> {
  private _messageInputNode: MessageInputNode;
  private _messageOutputNode: MessageOutputNode;

  constructor(id: string, options?: MessageAddModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageInputNode = new MessageInputNode(
      this._messageInputCallback.bind(this),
    );
    this._messageOutputNode = new MessageOutputNode();

    this._inputs = [new ModuleInput("input", this._messageInputNode)];
    this._outputs = [new ModuleOutput("output", this._messageOutputNode)];
  }

  get type(): AudioModuleType {
    return "msg-add";
  }

  private _messageInputCallback(time: number, data?: MessageBusDataType): void {
    const num = Number(data);
    if (!isNaN(num)) {
      this._messageOutputNode.scheduleMessage(
        time,
        num + this._options.addValue,
      );
    }
  }

  updateOptions(options: Partial<MessageAddModuleOptions>): void {
    if (options.addValue !== undefined) {
      this._options.addValue = options.addValue;
    }
  }

  dispose(): void {}
}
