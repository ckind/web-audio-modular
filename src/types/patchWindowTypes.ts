import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import type { AudioModuleType } from "@/classes/factory/AudioModuleFactory";

export type Position = {
  x: number;
  y: number;
};

export type ConnectionInstance = {
  from: {
    moduleId: string;
    output: OutputInstance;
  };
  to: {
    moduleId: string;
    input: InputInstance;
  };
  selected?: boolean;
};

export type InputInstance = {
  name: string;
  moduleInput: ModuleInput;
  position: Position;
};

export type OutputInstance = {
  name: string;
  moduleOutput: ModuleOutput;
  position: Position;
};

export type ModuleInstance = {
  id: string;
  type: AudioModuleType;
  position: Position;
};

export type PatchGraph = {
  modules: ModuleInstance[];
  connections: ConnectionInstance[];
};
