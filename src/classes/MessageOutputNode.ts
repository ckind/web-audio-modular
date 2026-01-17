import type IMessageBusDestinationNode from "@/classes/interfaces/IMessageBusDestinationNode";

/**
 * MessageOutputNode is responsible for scheduling events that send
 * messages to IMessageBusDestinationNodes at specific times
 */
export default class MessageOutputNode {
  private _ctx: AudioContext;
  private _destinations: Array<IMessageBusDestinationNode> = [];
  private _messageEvents: Array<{ time: number; message: any }> = [];

  constructor(ctx: AudioContext) {
    this._ctx = ctx;
  }

  connect(destination: IMessageBusDestinationNode) {
    this._messageEvents.forEach((messageEvent) => {
      if (messageEvent.time >= this._ctx.currentTime) {
        destination.scheduleMessageCallback(
          messageEvent.time,
          messageEvent.message,
        );
      }
    });
    this._destinations.push(destination);
  }

  disconnect(destination?: IMessageBusDestinationNode) {
    if (!destination) {
      this._destinations.forEach((dest) =>
        dest.cancelScheduledMessageCallbacks(this._ctx.currentTime),
      );
      this._destinations = [];
      return;
    }

    destination.cancelScheduledMessageCallbacks(this._ctx.currentTime);
    this._destinations = this._destinations.filter(
      (dest) => dest !== destination,
    );
  }

  scheduleMessage(time: number, message: any) {
    this._messageEvents.push({ time, message });
    this._destinations.forEach((destination) =>
      destination.scheduleMessageCallback(time, message),
    );
  }

  cancelScheduledMessages(time: number) {
    this._messageEvents = this._messageEvents.filter(
      (messageEvent) => messageEvent.time < time,
    );
    this._destinations.forEach((destination) =>
      destination.cancelScheduledMessageCallbacks(time),
    );
  }
}
