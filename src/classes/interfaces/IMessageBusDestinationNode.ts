
/**
 * IMessageBusDestinationNode is an interface for nodes that can receive scheduled
 * messages from an IMessageBusSourceNode.
 */
export default interface IMessageBusDestinationNode {
  scheduleMessageCallback(time: number, data: any): void;
  cancelScheduledMessageCallbacks(time: number): void;
}