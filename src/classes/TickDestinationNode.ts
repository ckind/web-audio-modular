export default abstract class TickDestinationNode {
  private _ctx: AudioContext;
  private _callback: (time: number) => void;

  constructor(ctx: AudioContext, callback: (time: number) => void) {
    this._ctx = ctx;
    this._callback = callback;
  }

  get callback() {
    return this._callback;
  }
}