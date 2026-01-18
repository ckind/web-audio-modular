import { type IModuleInput } from "@/classes/ModuleInput";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import type { ConnectionType } from "@/types/connectionTypes"
import * as Tone from "tone";

export type ModuleOutputNode = Tone.ToneAudioNode | MessageOutputNode;

export interface IModuleOutput {
  name: string;
  node: ModuleOutputNode;
  type: ConnectionType;
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

  get type(): ConnectionType {
    if (this.node instanceof Tone.ToneAudioNode) {
      return "signal";
    } else if (this.node instanceof MessageOutputNode) {
      return "message-bus";
    } else {
      throw new Error("unknown connection type");
    }
  }

  connect(destination: IModuleInput) {
    if (this.type === "signal") {
      if (destination.node instanceof MessageInputNode) {
        console.error("Cannot connect signal output to message input");
        return;
      }

      (this.node as Tone.ToneAudioNode).connect(
        destination.node as Tone.ToneAudioNode,
      );
    } else if (this.type === "message-bus") {
      if (destination.node instanceof Tone.ToneAudioNode) {
        console.error("Cannot connect message bus output to signal input");
        return;
      }

      (this.node as MessageOutputNode).connect(
        destination.node as MessageInputNode,
      );
    } else {
      console.error("Unknown module output type");
      return;
    }
  }

  disconnect(destination?: IModuleInput) {
    if (!destination) {
      this.node.disconnect();

      return;
    }

    if (this.type === "signal") {
      if (destination.node instanceof MessageInputNode) {
        console.error(
          "Cannot disconnect signal output from message input",
        );
        return;
      }

      (this.node as Tone.ToneAudioNode).disconnect(
        destination.node as Tone.ToneAudioNode,
      );
    } else if (this.type === "message-bus") {
      if (destination.node instanceof Tone.ToneAudioNode) {
        console.error(
          "Cannot disconnect message bus output from signal input",
        );
        return;
      }

      (this.node as MessageOutputNode).disconnect(
        destination.node as MessageInputNode,
      );
    } else {
      console.error("Unknown module output type");
      return;
    }
  }
}
