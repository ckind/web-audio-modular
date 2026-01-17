import type IMessageBusDestinationNode from "./interfaces/IMessageBusDestinationNode";

type MessageInputNodeCallback = (message: any) => void;

/**
 * MessageInputNode is a MessageBusDestinationNode that allows us to
 * schedule changes to discrete parameters or trigger events at specific times
 */
export class MessageInputNode implements IMessageBusDestinationNode {
  private _controller = new AbortController();
  private _ctx: AudioContext;
  private _signal = this._controller.signal;
  private _callback: MessageInputNodeCallback;

  constructor(ctx: AudioContext, callback: MessageInputNodeCallback) {
    this._ctx = ctx;
    this._callback = callback;
  }

  scheduleMessageCallback(time: number, message: any): void {
    // todo: not sample accurate, could be improved by using a
    // web worker or AudioWorklet to handle the timing more precisely
    window.setTimeout(
      this._callback.bind(this, message),
      (time - this._ctx.currentTime) * 1000, 
      { signal: this._signal },
    );
  }

  clearTimeouts() {
    this._controller.abort();
    this._controller = new AbortController();
    this._signal = this._controller.signal;
  }

  cancelScheduledMessageCallbacks(time: number): void {
    window.setTimeout(
      this.clearTimeouts.bind(this),
      (time - this._ctx.currentTime) * 1000,
    );
  }
}
