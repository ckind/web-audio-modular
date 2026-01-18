import type {
  ModuleId,
  IAudioModule,
} from "@/classes/audio-modules/AudioModule";

type InputId = {
  moduleId: string;
  inputName: string;
};

type OutputId = {
  moduleId: string;
  outputName: string;
};

type Connection = {
  from: OutputId;
  to: InputId;
};

/**
 * The Patcher class manages all the internal audio connections
 * of the patch graph separately from the GUI
 */
export default class Patcher {
  private _modules: Map<ModuleId, IAudioModule>;
  private _connections: Array<Connection>;

  constructor() {
    this._modules = new Map<ModuleId, IAudioModule>();
    this._connections = new Array<Connection>();
  }

  private _getInput(inputId: InputId) {
    const inputModule = this._modules.get(inputId.moduleId);

    if (!inputModule) {
      throw new Error(`Input module with id ${inputId.moduleId} not found`);
    }

    const moduleInput = inputModule.inputs.find(
      (i) => i.name === inputId.inputName,
    );

    if (!moduleInput) {
      throw new Error(
        `Input with name ${inputId.inputName} not found in module ${inputId.moduleId}`,
      );
    }

    return moduleInput;
  }

  private _getOutput(outputId: OutputId) {
    const outputModule = this._modules.get(outputId.moduleId);

    if (!outputModule) {
      throw new Error(`Output module with id ${outputId.moduleId} not found`);
    }

    const moduleOutput = outputModule.outputs.find(
      (o) => o.name === outputId.outputName,
    );

    if (!moduleOutput) {
      throw new Error(
        `Output with name ${outputId.outputName} not found in module ${outputId.moduleId}`,
      );
    }

    return moduleOutput;
  }

  private _outputsAreEqual(a: OutputId, b: OutputId) {
    return a.moduleId === b.moduleId && a.outputName === b.outputName;
  }

  private _inputsAreEqual(a: InputId, b: InputId) {
    return a.moduleId === b.moduleId && a.inputName === b.inputName;
  }

  clear() {
    for (const module of this._modules.values()) {
      this.deleteModule(module.id);
    }

    this._modules.clear();
    this._connections = [];
  }

  addModule(module: IAudioModule) {
    this._modules.set(module.id, module);
  }

  deleteModule(moduleId: ModuleId) {
    const module = this._modules.get(moduleId);

    if (!module) {
      throw new Error(`Module with id ${moduleId} not found`);
    }

    for (let i = 0; i < this._connections.length; i++) {
      // disconnect all outgoing and incoming connections
      if (
        this._connections[i]!.from.moduleId === moduleId ||
        this._connections[i]!.to.moduleId === moduleId
      ) {
        this.disconnect(this._connections[i]!.from, this._connections[i]!.to);
        this._connections.splice(i, 1);
        i--;
      }
    }

    module.dispose();
    this._modules.delete(moduleId);
  }

  getModule(moduleId: ModuleId) {
    const module = this._modules.get(moduleId);

    if (!module) {
      throw new Error(`Module with id ${moduleId} not found`);
    }

    return module;
  }

  connect(outputId: OutputId, inputId: InputId) {
    const moduleOutput = this._getOutput(outputId);
    const moduleInput = this._getInput(inputId);

    moduleOutput.connect(moduleInput);

    // todo: connection constraints?
    this._connections.push({ from: outputId, to: inputId });
  }

  disconnect(outputId: OutputId, inputId?: InputId) {
    const moduleOutput = this._getOutput(outputId);

    if (inputId) {
      const moduleInput = this._getInput(inputId);
      moduleOutput.disconnect(moduleInput);
      for (let i = 0; i < this._connections.length; i++) {
        if (
          this._outputsAreEqual(this._connections[i]!.from, outputId) &&
          this._inputsAreEqual(this._connections[i]!.to, inputId)
        ) {
          this._connections.splice(i, 1);
          i--;
        }
      }
    } else {
      moduleOutput.disconnect();
      for (let i = 0; i < this._connections.length; i++) {
        if (this._outputsAreEqual(this._connections[i]!.from, outputId)) {
          this._connections.splice(i, 1);
          i--;
        }
      }
    }
  }
}
