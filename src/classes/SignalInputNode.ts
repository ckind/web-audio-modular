import type IMessageBusDestinationNode from "@/classes/interfaces/IMessageBusDestinationNode";
import * as Tone from "tone";

/**
 * SignalInputNode is wrapper around an Tone.Signal that allows it to be
 * used as a destination for scheduled events from a MessageBusSourceNode
 */
export default class SignalInputNode implements IMessageBusDestinationNode {
  private _ctx: AudioContext;

  public signal: Tone.Signal;

  constructor(ctx: AudioContext, signal: Tone.Signal) {
    this._ctx = ctx;
    this.signal = signal;
  }

  cancelScheduledMessageCallbacks(time: number): void {
    // todo: what if multiple MessageBusSourceNodes are connected to this SignalInputNode?
    // this will clear all scheduled values
    // should we allow multiple sources for a message bus destination?
    this.signal.cancelScheduledValues(time);
  }

  scheduleMessageCallback(time: number, message: any) {
    // todo: data type validation?
    this.signal.setValueAtTime(message, time);
  }
}
