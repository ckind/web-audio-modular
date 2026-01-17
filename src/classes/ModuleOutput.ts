import ModuleInput from "./ModuleInput";
import AudioParamNode from "./AudioParamNode";
import MessageOutputNode from "./MessageOutputNode";
import { MessageInputNode } from "./MessageInputNode";

export type ModuleOutputNode = AudioNode | MessageOutputNode;

export default class ModuleOutput {
  public name: string;
  public node: ModuleOutputNode;

  constructor(name: string, node: ModuleOutputNode) {
    this.node = node;
    this.name = name;
  }

  connect(destination: ModuleInput) {
    if (this.node instanceof MessageOutputNode) {
      if (destination.node instanceof MessageInputNode) {
        this.node.connect(destination.node);
      }
      else if (destination.node instanceof AudioParamNode) {
        this.node.connect(destination.node);
      }
    } else if (this.node instanceof AudioNode) {
      if (destination.node instanceof AudioNode) {
        this.node.connect(destination.node);
      } else if (destination.node instanceof AudioParamNode) {
        this.node.connect(destination.node.audioParam);
      }
    }
  }

  disconnect(destination?: ModuleInput) {
    console.log("disconnecting output:", this.name, "from input:", destination?.name);
    if (
      !destination ||
      destination.node === undefined ||
      destination.node === null
    ) {
      if (this.node instanceof MessageOutputNode) {
        this.node.disconnect();
      } else if (this.node instanceof AudioNode) {
        this.node.disconnect();
      }

      return;
    }

    if (this.node instanceof MessageOutputNode) {
      if (destination.node instanceof MessageInputNode) {
        this.node.disconnect(destination.node);
      } else if (destination.node instanceof AudioParamNode) {
        this.node.disconnect(destination.node);
      }
    } else if (this.node instanceof AudioNode) {
      if (destination.node instanceof AudioNode) {
        this.node.disconnect(destination.node);
      } else if (destination.node instanceof AudioParamNode) {
        this.node.disconnect(destination.node.audioParam);
      }
    }
  }
}
