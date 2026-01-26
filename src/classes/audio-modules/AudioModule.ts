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
  | "num-to-signal"
  | "sample"
  | "sample-and-hold"
  | "sequence"
  | "seq-step"
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
  | "str-input"
  | "msg-regex"
  | "num-counter"
  | "num-mod"
  | "num-add"
  | "num-multiply"
  | "midi-num-to-hz"
  | "list-element"
  | "list-merge"
  | "sampler"
  | "sampler-plus"
  | "player"
  | "grain-player"
  | "ui-switch"
  | "synth-mono";

export type ModuleId = string;

export interface IAudioModule<TModuleOptions> {
  id: ModuleId;
  type: AudioModuleType;
  inputs: IModuleInput[];
  outputs: IModuleOutput[];
  options: TModuleOptions;

  updateOptions(options: Partial<TModuleOptions>): void;
  dispose(): void;
  updateUIState?: UpdateUIStateCallback<TModuleOptions>;
}

export type UpdateUIStateCallback<TModuleOptions> = (options: Partial<TModuleOptions>, guiState?: any) => void;

export default abstract class AudioModule<
  TModuleOptions,
> implements IAudioModule<TModuleOptions> {
  protected _inputs: IModuleInput[] = [];
  protected _outputs: IModuleOutput[] = [];
  protected _options: TModuleOptions;

  public id: ModuleId;

  // optional callback used to send UI state data back to the view model
  public updateUIState?: UpdateUIStateCallback<TModuleOptions>;

  constructor(id: ModuleId, options: TModuleOptions) {
    this.id = id;
    this._options = options;
  }

  abstract get type(): AudioModuleType;
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
