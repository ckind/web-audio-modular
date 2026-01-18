import { type ModuleId } from "@/classes/audio-modules/AudioModule";
import type { ConnectionType } from "@/types/connectionTypes";

export type Position = {
  x: number;
  y: number;
};

export type PatchCableInstance = {
  from: Position;
  to: Position;
  selected?: boolean;
};

export type ConnectionInputInstance = {
  name: string;
  position: Position;
};

export type ConnectionOutputInstance = {
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
  guiComponent?: string;
};

export type ConnectionInstance = {
  from: {
    moduleId: ModuleId;
    output: ConnectionOutputInstance;
  };
  to: {
    moduleId: ModuleId;
    input: ConnectionInputInstance;
  };
  selected?: boolean;
};

export type PatchGraph = {
  modules: ModuleInstance[];
  connections: ConnectionInstance[];
};
