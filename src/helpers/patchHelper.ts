import type { ConnectionInstance, ModuleInstance, PatchGraph } from "@/types/uIInstanceTypes";



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