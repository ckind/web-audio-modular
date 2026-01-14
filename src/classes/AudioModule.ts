import ModuleInput from "./ModuleInput";
import ModuleOutput from "./ModuleOutput";
import { type AudioModuleType } from "./factory/AudioModuleFactory";

export default abstract class AudioModule {
  protected _ctx: AudioContext;
  protected _inputs: Map<string, ModuleInput> = new Map();
  protected _outputs: Map<string, ModuleOutput> = new Map();

  public id: string;

  constructor(ctx: AudioContext) {
    this._ctx = ctx;
    this.id = crypto.randomUUID();
  }

  abstract get type(): AudioModuleType;

  get inputs(): Map<string, ModuleInput> {
    return this._inputs;
  }
  get outputs(): Map<string, ModuleOutput> {
    return this._outputs;
  }
}

