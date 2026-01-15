import ModuleInput from "../ModuleInput";
import ModuleOutput from "../ModuleOutput";
import { type AudioModuleType } from "../factory/AudioModuleFactory";

export default abstract class AudioModule<TModuleOptions> {
  protected _ctx: AudioContext;
  protected _inputs: ModuleInput[] = [];
  protected _outputs: ModuleOutput[] = [];
  protected _options: TModuleOptions;

  public id: string;

  constructor(id: string, ctx: AudioContext, options: TModuleOptions) {
    this._ctx = ctx;
    this.id = id;
    this._options = options;
  }

  abstract get type(): AudioModuleType;
  abstract updateOptions(options: Partial<TModuleOptions>): void;

  get inputs(): ModuleInput[] {
    return this._inputs;
  }

  get outputs(): ModuleOutput[] {
    return this._outputs;
  }

  get options(): TModuleOptions {
    return this._options;
  }
}
