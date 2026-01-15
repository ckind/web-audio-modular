import type { ModuleInstance, PatchGraph } from "@/types/patchWindowTypes";

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