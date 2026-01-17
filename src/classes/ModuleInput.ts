import * as Tone from "tone";

export type ModuleInputNode = Tone.ToneAudioNode | Tone.Param<any>;

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
