import { de } from "vuetify/locale";
import ModuleInput from "./ModuleInput";
import TickDestinationNode from "./TickDestinationNode";
import TickSourceNode from "./TickSourceNode";

export interface IModuleOutput {
  node: AudioNode | TickSourceNode;
  name: string;
  connect(destination: ModuleInput): void;
  disconnect(): void;
  disconnect(destination: ModuleInput): void;
}

export default class ModuleOutput implements IModuleOutput {
  public node: AudioNode | TickSourceNode;
  public name: string;

  constructor(name: string, node: AudioNode | TickSourceNode) {
    this.node = node;
    this.name = name;
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

  disconnect(destination?: ModuleInput) {
    if (!destination) {
      if (this.node instanceof TickSourceNode) {
        this.node.disconnect();
      } else if (this.node instanceof AudioNode) {
        this.node.disconnect();
      }
      
      return;
    }

    if (this.node instanceof TickSourceNode) {
      if (destination.node instanceof TickDestinationNode) {
        this.node.disconnect(destination.node);
      }
    } else if (this.node instanceof AudioNode) {
      if (destination.node instanceof AudioNode) {
        this.node.disconnect(destination.node);
      } else if (destination.node instanceof AudioParam) {
        this.node.disconnect(destination.node);
      }
    }
  }
}
