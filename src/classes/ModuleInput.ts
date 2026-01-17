import * as Tone from "tone";
import type MessageInputNode from "./MessageInputNode";

export type ModuleInputNode = Tone.ToneAudioNode | Tone.Param<any> | MessageInputNode;

export interface IModuleInput {
  name: string;
  node: ModuleInputNode;
}

export default class ModuleInput implements IModuleInput {
  public node: ModuleInputNode;
  public name: string;

  constructor(name: string, node: ModuleInputNode) {
    this.name = name;
    this.node = node;
  }
}
