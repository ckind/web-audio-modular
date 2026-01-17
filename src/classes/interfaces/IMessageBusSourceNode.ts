import type IMessageBusDestinationNode from "@/classes/interfaces/IMessageBusDestinationNode";

/**
 * IMessageBusSourceNode represents a source of messages that can be scheduled
 * to send data to connected IMessageBusDestinationNodes.
 * IMessageBusSourceNode schedules events but IMessageBusDestinationNode is
 * responsible for executing its own callback at the provided sample accurate time.
 */
export default interface IMessageBusSourceNode {
  scheduleMessage(time: number, data: any): void;
  cancelScheduledMessages(time: number): void;
  connect(destination: IMessageBusDestinationNode): void;
  disconnect(destination?: IMessageBusDestinationNode): void;
}