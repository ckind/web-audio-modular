import { type IModuleInput } from "@/classes/ModuleInput";
import { type IModuleOutput } from "@/classes/ModuleOutput";
import ResourceFileManager from "@/classes/ResourceFileManager";
import ResourceFile from "@/classes/ResourceFile";

export type AudioModuleType =
  | "speaker-output"
  | "osc"
  | "osc-pulse"
  | "osc-fm"
  | "ui-knob"
  | "ui-knob-msg"
  | "constant-signal"
  | "gain"
  | "clock"
  | "logger"
  | "scale"
  | "scale-exp"
  | "msg-to-signal"
  | "msg-sample"
  | "sample-and-hold"
  | "sequence"
  | "ui-slider"
  | "ui-slider-msg"
  | "msg-display"
  | "filter"
  | "fx-convolution-reverb"
  | "fx-delay"
  | "fx-delay-analog"
  | "delay"
  | "ui-button"
  | "noise"
  | "env-adsr"
  | "midi-input"
  | "midi-cc"
  | "pow-curve"
  | "patch-notes"
  | "midi-note-message"
  | "env-amp"
  | "msg-box"
  | "msg-regex"
  | "msg-counter"
  | "msg-mod"
  | "msg-add"
  | "msg-multiply"
  | "midi-num-to-hz"
  | "msg-list-element"
  | "sampler"
  | "sampler-plus"
  | "player"
  | "grain-player"
  | "ui-switch";

export type ModuleId = string;

export interface IAudioModule {
  id: ModuleId;
  type: AudioModuleType;
  inputs: IModuleInput[];
  outputs: IModuleOutput[];
  options: any;

  updateOptions(options: Partial<any>): void;
  dispose(): void;
  updateUIState?: UpdateUIStateCallback;
}

export type UpdateUIStateCallback = (options: any, guiState?: any) => void;

export default abstract class AudioModule<
  TModuleOptions,
> implements IAudioModule {
  protected _inputs: IModuleInput[] = [];
  protected _outputs: IModuleOutput[] = [];
  protected _options: TModuleOptions;

  public id: ModuleId;

  // optional callback used to send UI state data back to the view model
  public updateUIState?: UpdateUIStateCallback;

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

  protected updateResourceFile(
    oldResourceFile?: ResourceFile,
    newResourceFile?: ResourceFile,
  ): void {
    const oldIsRes = oldResourceFile?.isResourceFile === true;
    const newIsRes = newResourceFile?.isResourceFile === true;

    if (oldIsRes && !newIsRes) {
      if (oldResourceFile?.name) {
        ResourceFileManager.releaseResource(oldResourceFile.name);
      }
    } else if (newIsRes && newResourceFile?.name) {
      if (!oldIsRes) {
        ResourceFileManager.requestResource(newResourceFile.name);
      } else if (oldResourceFile?.name !== newResourceFile.name) {
        if (oldResourceFile?.name) {
          ResourceFileManager.releaseResource(oldResourceFile.name);
        }

        ResourceFileManager.requestResource(newResourceFile.name);
      }
    }
  }
}
