import TickDestinationNode from "./TickDestinationNode.ts";

export default class TickSourceNode {
  private _ctx: AudioContext;
  private _connections: Array<TickDestinationNode> = [];

  constructor(ctx: AudioContext) {
    this._ctx = ctx;
  }

  connect(destination: TickDestinationNode) {
    this._connections.push(destination);
  }

  disconnect(destination: TickDestinationNode) {
    this._connections = this._connections.filter(connection => connection !== destination);
  }
  
  scheduleTick(time: number) {
    this._connections.forEach(connection => connection.callback(time));
  }
}