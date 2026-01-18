import * as Tone from "tone";
import MessageInputNode from "./MessageInputNode";
import type { ConnectionType } from "@/types/connectionTypes";

export type ModuleInputNode =
  | Tone.ToneAudioNode
  | Tone.Param<any>
  | MessageInputNode;

export interface IModuleInput {
  name: string;
  type: ConnectionType;
  node: ModuleInputNode;
}

export default class ModuleInput implements IModuleInput {
  public node: ModuleInputNode;
  public name: string;

  constructor(name: string, node: ModuleInputNode) {
    this.name = name;
    this.node = node;
  }

  get type(): ConnectionType {
    if (this.node instanceof Tone.ToneAudioNode) {
      return "signal";
    } else if (this.node instanceof Tone.Param) {
      return "signal";
    } else if (this.node instanceof MessageInputNode) {
      return "message-bus";
    } else {
      throw new Error("unknown connection type");
    }
  }
}
