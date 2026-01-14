import { de } from "vuetify/locale";
import ModuleInput from "./ModuleInput";
import TickDestinationNode from "./TickDestinationNode";
import TickSourceNode from "./TickSourceNode";

export interface IModuleOutput {
  node: AudioNode | TickSourceNode;
  connect(destination: ModuleInput): void;
  disconnect(): void;
}

export default class ModuleOutput implements IModuleOutput {
  public node: AudioNode | TickSourceNode;

  constructor(node: AudioNode | TickSourceNode) {
    this.node = node;
  }

  connect(destination: ModuleInput) {
    if (this.node instanceof TickSourceNode) {
      if (destination.node instanceof TickDestinationNode) {
        this.node.connect(destination.node);
      }
    } else if (this.node instanceof AudioNode)
      if (destination.node instanceof AudioNode) {
        this.node.connect(destination.node);
      } else if (destination.node instanceof AudioParam) {
        this.node.connect(destination.node);
      }
  }

  disconnect() {
    // todo: implement disconnect logic
  }
}
