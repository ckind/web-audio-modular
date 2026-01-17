import ModuleInput from "../ModuleInput";
import ModuleOutput from "../ModuleOutput";

export type AudioModuleType = "speaker-output" | "oscillator" | "gain"| "clock" | "logger";

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

  abstract get type(): AudioModuleType; // todo: how to serialize this?
  abstract updateOptions(options: Partial<TModuleOptions>): void;
  abstract dispose(): void;

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
