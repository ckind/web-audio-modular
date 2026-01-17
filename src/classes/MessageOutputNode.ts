import type IMessageBusSourceNode from "@/classes/interfaces/IMessageBusSourceNode";
import type IMessageBusDestinationNode from "./interfaces/IMessageBusDestinationNode";

export default class MessageOutputNode implements IMessageBusSourceNode {
  private _destinations: IMessageBusDestinationNode[] = [];

  constructor() {}

  scheduleMessage(time: number, data: any): void {
    this._destinations.forEach((destination) =>
      destination.scheduleMessageCallback(time, data),
    );
  }

  cancelScheduledMessages(time: number): void {
    throw new Error("Method not implemented.");
  }

  connect(destination: IMessageBusDestinationNode): void {
    this._destinations.push(destination);
  }

  disconnect(destination?: IMessageBusDestinationNode): void {
    if (!destination) {
      this._destinations = [];
      return;
    }

    this._destinations.splice(this._destinations.indexOf(destination), 1);
  }
}
