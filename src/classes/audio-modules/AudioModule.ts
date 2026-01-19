import { type IModuleInput } from "@/classes/ModuleInput";
import { type IModuleOutput }  from "@/classes/ModuleOutput";

export type AudioModuleType =
  | "speaker-output"
  | "oscillator"
  | "gain"
  | "clock"
  | "logger"
  | "scale"
  | "scale-exp"
  | "message-to-signal"
  | "sequence"
  | "slider"
  | "display-message"
  | "filter"
  | "convolution-reverb"
  | "button-trig"
  | "noise"
  | "adsr-envelope"
  | "midi-input"
  | "midi-cc-to-signal"
  | "pow-curve"
  | "patch-notes"
  | "midi-note-message"
  | "adsr-amplitude"
  | "message-trig"
  | "midi-num-to-hz"
  | "split"
  ;

export type ModuleId = string;

export interface IAudioModule {
  id: ModuleId;
  type: AudioModuleType;
  inputs: IModuleInput[];
  outputs: IModuleOutput[];
  options: any;

  updateOptions(options: Partial<any>): void;
  dispose(): void;
  updateUIInstanceOptions?: UpdateUIStateCallback;
  updateUIInstanceOutputs?: UpdateUIStateCallback;
}

export type UpdateUIStateCallback = (data: any) => void;

export default abstract class AudioModule<TModuleOptions> implements IAudioModule {
  protected _inputs: IModuleInput[] = [];
  protected _outputs: IModuleOutput[] = [];
  protected _options: TModuleOptions;

  public id: ModuleId;

  // optional callback used to send options data back to the view model
  public updateUIInstanceOptions?: UpdateUIStateCallback;
  // optional callback used to send outputs data back to the view model
  public updateUIInstanceOutputs?: UpdateUIStateCallback;

  constructor(id: ModuleId, options: TModuleOptions)  {
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
