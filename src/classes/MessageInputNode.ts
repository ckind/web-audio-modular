import type IMessageBusDestinationNode from "@/classes/interfaces/IMessageBusDestinationNode";
import type { MessageBusDataType } from "@/types/connectionTypes";

type MessageInputNodeCallback = (time: number, data?: MessageBusDataType) => void;

/**
 * MessageInputNode is a MessageBusDestinationNode that allows us to
 * schedule changes to discrete parameters or trigger events at specific times
 */

export default class MessageInputNode implements IMessageBusDestinationNode {
  private _callback: MessageInputNodeCallback;

  constructor(callback: MessageInputNodeCallback) {
    this._callback = callback;
  }

  scheduleMessageCallback(time: number, data?: MessageBusDataType): void {
    this._callback(time, data);
  }

  cancelScheduledMessageCallbacks(time: number): void {
    throw new Error("Method not implemented.");
  }
}