import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";
import ResourceFile from "@/classes/ResourceFile";

export type PlayerModuleOptions = {
  resourceFile: ResourceFile;
  startPosition: number;
  fadeInTime: number;
  fadeOutTime: number;
  reverse: boolean;
};

const getDefaultOptions = (): PlayerModuleOptions => ({
  resourceFile: new ResourceFile(),
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

  constructor(id: string, options?: PlayerModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._player = new Tone.Player();
    this._player.fadeIn = this._options.fadeInTime;
    this._player.fadeOut = this._options.fadeOutTime;
    this._player.reverse = this._options.reverse;

    console.log("PlayerModule created with options: ", this._options);

    if (this._options.resourceFile.blobUrl) {
      console.log("Loading resource file from options: ", this._options.resourceFile);
      this.loadResourceFile(this._options.resourceFile);
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

  loadResourceFile(resourceFile: ResourceFile) {
    this._player.load(resourceFile.blobUrl!);
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
    // todo: validate data is between 0 and 1
    Tone.getTransport().schedule(() => {
      if (this._player.loaded && typeof data === "number") {
        this._startPositionSeconds = data * this._player.buffer.duration;
      }
    }, time);
  }

  updateOptions(options: Partial<PlayerModuleOptions>): void {
    if (options.resourceFile !== undefined) {
      this._options.resourceFile = options.resourceFile;
      this.loadResourceFile(options.resourceFile);
    }
    if (options.fadeInTime !== undefined) {
      this._options.fadeInTime = options.fadeInTime;
      this._player.fadeIn = options.fadeInTime;
    }
    if (options.fadeOutTime !== undefined) {
      this._options.fadeOutTime = options.fadeOutTime;
      this._player.fadeOut = options.fadeOutTime;
    }
    if (options.reverse !== undefined) {
      this._options.reverse = options.reverse;
      this._player.reverse = options.reverse;
    }
  }

  dispose(): void {
    this._player.dispose();
  }
}
