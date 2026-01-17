import type IMessageBusDestinationNode from "./interfaces/IMessageBusDestinationNode";

/**
 * AudioParamNode is wrapper around an AudioParam that allows it to be
 * used as a destination for scheduled events from a MessageBusSourceNode
 */
export default class AudioParamNode {
  private _ctx: AudioContext;

  public audioParam: AudioParam;

  constructor(ctx: AudioContext, audioParam: AudioParam) {
    this._ctx = ctx;
    this.audioParam = audioParam;
  }

  cancelScheduledMessageCallbacks(time: number): void {
    // todo: what if multiple MessageBusSourceNodes are connected to this AudioParamNode?
    // this will clear all scheduled values
    // should we allow multiple sources for a message bus destination?
    this.audioParam.cancelScheduledValues(time);
  }

  scheduleMessageCallback(time: number, data: any) {
    if (typeof data !== "number") {
      console.warn("AudioParamNode received non-numeric message bus data:", data);
      return;
    }
    this.audioParam.setValueAtTime(data, time);
  }
}
