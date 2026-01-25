import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";
import ResourceFile from "@/classes/ResourceFile";
import ResourceFileManager from "@/classes/ResourceFileManager";
import { clamp } from "@/helpers/units";

export type PlayerModuleOptions = {
  resourceFile: ResourceFile | null;
  startPosition: number;
  fadeInTime: number;
  fadeOutTime: number;
  reverse: boolean;
};

const getDefaultOptions = (): PlayerModuleOptions => ({
  resourceFile: null,
  startPosition: 0,
  fadeInTime: 0.01,
  fadeOutTime: 0.01,
  reverse: false,
});

export default class PlayerModule extends AudioModule<PlayerModuleOptions> {
  private _player: Tone.Player;
  private _startInputNode: MessageInputNode;
  private _stopInputNode: MessageInputNode;
  private _startPositionInputNode: MessageInputNode;
  private _startPositionSeconds: number = 0;
  private _resourceUrl?: string;

  constructor(id: string, options?: PlayerModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._player = new Tone.Player();
    this._player.fadeIn = this._options.fadeInTime;
    this._player.fadeOut = this._options.fadeOutTime;
    this._player.reverse = this._options.reverse;

    if (this._options.resourceFile !== null) {
      console.log(
        "Loading resource file from options: ",
        this._options.resourceFile,
      );
      this._resourceUrl = ResourceFileManager.requestResource(
        this._options.resourceFile.name,
      );
      this._player.load(this._resourceUrl!);
    }

    this._startInputNode = new MessageInputNode(
      this.startInputCallback.bind(this),
    );
    this._stopInputNode = new MessageInputNode(
      this.stopInputCallback.bind(this),
    );
    this._startPositionInputNode = new MessageInputNode(
      this.startPositionInputCallback.bind(this),
    );

    this._inputs = [
      new ModuleInput("start", this._startInputNode),
      new ModuleInput("stop", this._stopInputNode),
      new ModuleInput("start-position", this._startPositionInputNode),
    ];
    this._outputs = [new ModuleOutput("output", this._player)];
  }

  get type(): AudioModuleType {
    return "player";
  }

  startInputCallback(time: number, data?: MessageBusDataType): void {
    if (this._player.loaded) {
      this._player.start(time, this._startPositionSeconds);
    }
  }

  stopInputCallback(time: number, data?: MessageBusDataType): void {
    if (this._player.loaded) {
      this._player.stop(time);
    }
  }

  startPositionInputCallback(time: number, data?: MessageBusDataType): void {
    const num = Number(data);
    if (data && !isNaN(num)) {
      Tone.getTransport().schedule(() => {
        if (this._player.loaded) {
          this._startPositionSeconds =
            clamp(num, 0, 1) * this._player.buffer.duration;
        }
      }, time);
    }
  }

  updateOptions(newOptions: Partial<PlayerModuleOptions>): void {
    if (newOptions.resourceFile !== undefined) {
      const nextName = newOptions.resourceFile?.name ?? null;
      const currentName = this.options.resourceFile?.name ?? null;
      // Avoid release/re-request if name is unchanged; prevents transient refCount=0.
      if (nextName && currentName && nextName === currentName) {
        // no-op
      } else {
        if (this.options.resourceFile !== null && this._resourceUrl) {
          // release the old resource url
          ResourceFileManager.releaseResource(this.options.resourceFile.name);
          this._resourceUrl = undefined;
        }

        if (newOptions.resourceFile === null) {
          this.options.resourceFile = null;
        } else {
          this.options.resourceFile = new ResourceFile(
            newOptions.resourceFile.name,
          );
          this._resourceUrl = ResourceFileManager.requestResource(
            newOptions.resourceFile.name,
          );
          this._player.load(this._resourceUrl!);
        }
      }
    }
    if (newOptions.fadeInTime !== undefined) {
      this.options.fadeInTime = newOptions.fadeInTime;
      this._player.fadeIn = newOptions.fadeInTime;
    }
    if (newOptions.fadeOutTime !== undefined) {
      this.options.fadeOutTime = newOptions.fadeOutTime;
      this._player.fadeOut = newOptions.fadeOutTime;
    }
    if (newOptions.reverse !== undefined) {
      this.options.reverse = newOptions.reverse;
      this._player.reverse = newOptions.reverse;
    }
  }

  dispose(): void {
    if (this.options.resourceFile !== null && this._resourceUrl) {
      ResourceFileManager.releaseResource(this.options.resourceFile.name);
      this._resourceUrl = undefined;
    }
    this._player.dispose();
  }
}
