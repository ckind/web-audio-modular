import TickDestinationNode from "./TickDestinationNode";

export interface IModuleInput {
  name: string;
  node: AudioNode | AudioParam | TickDestinationNode;
}

export default class ModuleInput implements IModuleInput {
  public node: AudioNode | AudioParam | TickDestinationNode;
  public name: string;

  constructor(name: string, node: AudioNode | AudioParam | TickDestinationNode) {
    this.name = name;
    this.node = node;
  }
}
