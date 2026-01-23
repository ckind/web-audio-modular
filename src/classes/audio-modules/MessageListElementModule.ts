import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import type { MessageBusDataType } from "@/types/connectionTypes";

export type MessageListElementModuleOptions = {
  index: number;
};

const getDefaultOptions = (): MessageListElementModuleOptions => ({
  index: 0,
});

function isAnyArray(value: any): boolean {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}

export default class MessageListElementModule extends AudioModule<MessageListElementModuleOptions> {
  private _messageInputNode: MessageInputNode;
  private _messageOutputNode: MessageOutputNode;

  constructor(id: string, options?: MessageListElementModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageInputNode = new MessageInputNode(
      this._messageInputCallback.bind(this),
    );
    this._messageOutputNode = new MessageOutputNode();

    this._inputs = [new ModuleInput("input", this._messageInputNode)];
    this._outputs = [new ModuleOutput("output", this._messageOutputNode)];
  }

  get type(): AudioModuleType {
    return "msg-list-element";
  }

  private _messageInputCallback(time: number, data?: MessageBusDataType): void {
    console.log("MessageListElementModule received data:", data);
    if (isAnyArray(data)) {
      const array = data as ArrayLike<any>;
      console.log("MessageListElementModule processing array:", array, "with index:", this._options.index);
      if (array[this._options.index] !== undefined) {
        this._messageOutputNode.scheduleMessage(
          time,
          array[this._options.index],
        );
      }
    }
  }

  updateOptions(options: Partial<MessageListElementModuleOptions>): void {
    if (options.index !== undefined) {
      this._options.index = options.index;
    }
  }

  dispose(): void {}
}