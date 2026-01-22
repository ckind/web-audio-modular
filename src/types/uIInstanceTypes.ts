import { type ModuleId } from "@/classes/audio-modules/AudioModule";
import type { ConnectionType } from "@/types/connectionTypes";

export type Position = {
  x: number;
  y: number;
};

export type PatchCableInstance = {
  from: Position;
  to: Position;
  connectionType: ConnectionType;
  selected?: boolean;
};

export type ConnectionInputInstance = {
  name: string;
  type: ConnectionType;
  position: Position;
};

export type ModuleInputInstance = {
  name: string;
  type: ConnectionType;
};

export type ConnectionOutputInstance = {
  name: string;
  type: ConnectionType;
  position: Position;
};

export type ModuleOutputInstance = {
  name: string;
  type: ConnectionType;
};

export type ModuleInstance = {
  moduleId: ModuleId;
  type: string;
  options: Record<string, any>;
  outputs: ModuleOutputInstance[];
  inputs: ModuleInputInstance[];
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
  version: string;
  modules: ModuleInstance[];
  connections: ConnectionInstance[];
};
