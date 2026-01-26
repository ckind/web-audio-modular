import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import type { MessageBusDataType } from "@/types/connectionTypes";
import { mergeMessageElements } from "@/helpers/message.ts";

export type ListElementModuleOptions = {};

const getDefaultOptions = (): ListElementModuleOptions => ({});

export default class ListElementModule extends AudioModule<ListElementModuleOptions> {
  private _messageInput1Node: MessageInputNode;
  private _messageInput2Node: MessageInputNode;
  private _messageOutputNode: MessageOutputNode;
  private _store: Array<MessageBusDataType | null> = [null, null];

  constructor(id: string, options?: ListElementModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageInput1Node = new MessageInputNode(
      (time: number, data?: MessageBusDataType) =>
        this._messageInputCallback(0, time, data),
    );
    this._messageInput2Node = new MessageInputNode(
      (time: number, data?: MessageBusDataType) =>
        this._messageInputCallback(1, time, data),
    );
    this._messageOutputNode = new MessageOutputNode();

    this._inputs = [
      new ModuleInput("input-1", this._messageInput1Node),
      new ModuleInput("input-2", this._messageInput2Node),
    ];
    this._outputs = [new ModuleOutput("output", this._messageOutputNode)];
  }

  get type(): AudioModuleType {
    return "list-merge";
  }

  private _messageInputCallback(
    i: number,
    time: number,
    data?: MessageBusDataType,
  ): void {
    if (data === null || data === undefined) return;

    if (this._store[(i + 1) % 2] != null) {
      this._store[i] = data;
      console.log("sending list:", this._store[0], this._store[1]);
      this._messageOutputNode.scheduleMessage(
        time,
        mergeMessageElements(this._store[0]!, this._store[1]!),
      );
      this._store = [null, null];
    } else {
      this._store[i] = data;
      console.log("storing data:", this._store[0], this._store[1]);
    }
  }

  updateOptions(options: Partial<ListElementModuleOptions>): void {}

  dispose(): void {}
}
