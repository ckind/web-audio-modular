import TickDestinationNode from "./TickDestinationNode";

export interface IModuleInput {
  node: AudioNode | AudioParam | TickDestinationNode;
}

export default class ModuleInput implements IModuleInput {
  public node: AudioNode | AudioParam | TickDestinationNode;

  constructor(node: AudioNode | AudioParam | TickDestinationNode) {
    this.node = node;
  }
}
