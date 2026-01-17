import type { ConnectionInstance, ModuleInstance, PatchGraph } from "@/types/patchTypes";

export const computeInputPosition = (
  moduleInstance: ModuleInstance,
  inputIndex: number,
  totalInputs: number,
  moduleDisplayWidth: number,
  moduleDisplayHeight: number
) => {
  const widthMult = moduleDisplayWidth / totalInputs;
  return {
    x: moduleInstance.position.x + widthMult * (inputIndex + 0.5),
    y: moduleInstance.position.y,
  };
};

export const computeOutputPosition = (
  moduleInstance: ModuleInstance,
  outputIndex: number,
  totalOutputs: number,
  moduleDisplayWidth: number,
  moduleDisplayHeight: number
) => {
  const widthMult = moduleDisplayWidth / totalOutputs;
  return {
    x: moduleInstance.position.x + widthMult * (outputIndex + 0.5),
    y: moduleInstance.position.y + moduleDisplayHeight,
  };
};

export const logGraph = (patchGraph: PatchGraph) => {
  console.log(
    "Current Patch Graph:",
    JSON.parse(JSON.stringify(patchGraph, null, 2))
  );
};

export const logConnections = (connections: ConnectionInstance[]) => {
  connections.forEach((connection, index) => {
    console.log(
      `Connection ${index}:`,
      `From ${connection.from.output.name} ${connection.from.moduleId} `,
      `To ${connection.to.input.name} ${connection.to.moduleId}`
    );
  });
};