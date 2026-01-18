import { type IModuleInput } from "@/classes/ModuleInput";
import { type IModuleOutput }  from "@/classes/ModuleOutput";

export type AudioModuleType =
  | "speaker-output"
  | "oscillator"
  | "gain"
  | "clock"
  | "logger"
  | "scale"
  | "message-to-signal"
  | "sequence"
  | "slider";

export type ModuleId = string;

export interface IAudioModule {
  id: ModuleId;
  type: AudioModuleType;
  inputs: IModuleInput[];
  outputs: IModuleOutput[];
  options: any;

  updateOptions(options: Partial<any>): void;
  dispose(): void;
}

export default abstract class AudioModule<TModuleOptions> implements IAudioModule {
  protected _inputs: IModuleInput[] = [];
  protected _outputs: IModuleOutput[] = [];
  protected _options: TModuleOptions;

  public id: ModuleId;

  constructor(id: ModuleId, options: TModuleOptions) {
    this.id = id;
    this._options = options;
  }

  abstract get type(): AudioModuleType; // todo: how to serialize this?
  abstract updateOptions(options: Partial<TModuleOptions>): void;
  abstract dispose(): void;

  get inputs(): IModuleInput[] {
    return this._inputs;
  }

  get outputs(): IModuleOutput[] {
    return this._outputs;
  }

  get options(): TModuleOptions {
    return this._options;
  }
}
