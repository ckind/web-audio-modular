import { type ModuleId } from "@/classes/audio-modules/AudioModule";

export type Position = {
  x: number;
  y: number;
};

export type PatchCableInstance = {
  from: Position;
  to: Position;
  selected?: boolean;
};

export type InputInstance = {
  name: string;
  position: Position;
};

export type OutputInstance = {
  name: string;
  position: Position;
};

export type ModuleInstance = {
  moduleId: ModuleId;
  displayName: string;
  options: Record<string, any>;
  outputNames: string[];
  inputNames: string[];
  position: Position;
  selected?: boolean;
};

export type ConnectionInstance = {
  from: {
    moduleId: ModuleId;
    output: OutputInstance;
  };
  to: {
    moduleId: ModuleId;
    input: InputInstance;
  };
  selected?: boolean;
};

export type PatchGraph = {
  modules: ModuleInstance[];
  connections: ConnectionInstance[];
};
