import type IMessageBusDestinationNode from "@/classes/interfaces/IMessageBusDestinationNode";

type MessageInputNodeCallback = (time: number, message: any) => void;

/**
 * MessageInputNode is a MessageBusDestinationNode that allows us to
 * schedule changes to discrete parameters or trigger events at specific times
 */

export default class MessageInputNode implements IMessageBusDestinationNode {
  private _callback: MessageInputNodeCallback;

  constructor(callback: MessageInputNodeCallback) {
    this._callback = callback;
  }

  scheduleMessageCallback(time: number, data: any): void {
    this._callback(time, data);
  }

  cancelScheduledMessageCallbacks(time: number): void {
    throw new Error("Method not implemented.");
  }
}