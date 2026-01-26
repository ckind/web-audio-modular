import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import type { MessageBusDataType } from "@/types/connectionTypes";
import { isAnyArray } from "@/helpers/message";

export type ListElementModuleOptions = {
  index: number;
};

const getDefaultOptions = (): ListElementModuleOptions => ({
  index: 0,
});

export default class ListElementModule extends AudioModule<ListElementModuleOptions> {
  private _messageInputNode: MessageInputNode;
  private _messageOutputNode: MessageOutputNode;

  constructor(id: string, options?: ListElementModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageInputNode = new MessageInputNode(
      this._messageInputCallback.bind(this),
    );
    this._messageOutputNode = new MessageOutputNode();

    this._inputs = [new ModuleInput("input", this._messageInputNode)];
    this._outputs = [new ModuleOutput("output", this._messageOutputNode)];
  }

  get type(): AudioModuleType {
    return "list-element";
  }

  private _messageInputCallback(time: number, data?: MessageBusDataType): void {
    if (isAnyArray(data)) {
      const array = data as ArrayLike<any>;
      if (array[this._options.index] !== undefined) {
        this._messageOutputNode.scheduleMessage(
          time,
          array[this._options.index],
        );
      }
    }
  }

  updateOptions(options: Partial<ListElementModuleOptions>): void {
    if (options.index !== undefined) {
      this._options.index = options.index;
    }
  }

  dispose(): void {}
}