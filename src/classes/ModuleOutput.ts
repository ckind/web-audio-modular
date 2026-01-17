import ModuleInput, { type IModuleInput } from "@/classes/ModuleInput";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";

export type ModuleOutputNode = Tone.ToneAudioNode;

export interface IModuleOutput {
  name: string;
  node: ModuleOutputNode;
  connect(destination: IModuleInput): void;
  disconnect(destination?: IModuleInput): void;
}

export default class ModuleOutput implements IModuleOutput {
  public name: string;
  public node: ModuleOutputNode;

  constructor(name: string, node: ModuleOutputNode) {
    this.node = node;
    this.name = name;
  }

  connect(destination: IModuleInput) {
    console.log(this.node.context.rawContext === destination.node.context.rawContext);
    
    this.node.connect(destination.node);
  }

  disconnect(destination?: IModuleInput) {
    console.log("disconnecting output:", this.name, "from input:", destination?.name);

    if (
      !destination ||
      destination.node === undefined ||
      destination.node === null
    ) {
      this.node.disconnect();

      return;
    }

    this.node.disconnect(destination.node);
  }
}
