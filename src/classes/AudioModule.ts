import ModuleInput from "./ModuleInput";
import ModuleOutput from "./ModuleOutput";
import { type AudioModuleType } from "./factory/AudioModuleFactory";

export default abstract class AudioModule {
  protected _ctx: AudioContext;
  protected _inputs: ModuleInput[] = [];
  protected _outputs: ModuleOutput[] = [];

  public id: string;

  constructor(ctx: AudioContext) {
    this._ctx = ctx;
    this.id = crypto.randomUUID();
  }

  abstract get type(): AudioModuleType;

  get inputs(): ModuleInput[]{
    return this._inputs;
  }
  get outputs(): ModuleOutput[] {
    return this._outputs;
  }
}

