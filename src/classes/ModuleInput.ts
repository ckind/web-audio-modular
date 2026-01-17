import AudioParamNode from "./AudioParamNode";
import type { MessageInputNode } from "./MessageInputNode";

export type MessageBusDestinationNode = AudioParamNode | MessageInputNode;
export type ModuleInputNode = AudioNode | MessageBusDestinationNode;

export default class ModuleInput {
  public node: ModuleInputNode;
  public name: string;

  constructor(name: string, node: ModuleInputNode) {
    this.name = name;
    this.node = node;
  }
}
