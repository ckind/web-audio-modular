import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

export type PlayerModuleOptions = {
  audioUrl: string;
  startPosition: number;
  fadeInTime: number;
  fadeOutTime: number;
};

const getDefaultOptions = (): PlayerModuleOptions => ({
  audioUrl: "",
  startPosition: 0,
  fadeInTime: 0,
  fadeOutTime: 0,
});

export default class PlayerModule extends AudioModule<PlayerModuleOptions> {
  private _player: Tone.Player;
  private _triggerInputNode: MessageInputNode;
  private _startPositionInputNode: MessageInputNode;

  private _startPositionSeconds: number = 0;

  constructor(id: string, options?: PlayerModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._player = new Tone.Player(this._options.audioUrl);
    this._player.fadeIn = this._options.fadeInTime;
    this._player.fadeOut = this._options.fadeOutTime;

    this._triggerInputNode = new MessageInputNode(
      this.triggerInputCallback.bind(this),
    );
    this._startPositionInputNode = new MessageInputNode(
      this.startPositionInputCallback.bind(this),
    );

    this._inputs = [
      new ModuleInput("trigger-sample", this._triggerInputNode),
      new ModuleInput("start-position", this._startPositionInputNode),
    ];
    this._outputs = [new ModuleOutput("output", this._player)];
  }

  get type(): AudioModuleType {
    return "player";
  }

  triggerInputCallback(time: number, data?: MessageBusDataType): void {
    if (this._player.loaded) {
      this._player.start(time, this._startPositionSeconds);
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
    if (options.audioUrl !== undefined && options.audioUrl != "") {
      this._options.audioUrl = options.audioUrl;
      this._player.load(options.audioUrl);
    }
    if (options.fadeInTime !== undefined) {
      this._options.fadeInTime = options.fadeInTime;
      this._player.fadeIn = options.fadeInTime;
    }
    if (options.fadeOutTime !== undefined) {
      this._options.fadeOutTime = options.fadeOutTime;
      this._player.fadeOut = options.fadeOutTime;
    }
  }

  dispose(): void {
    this._player.dispose();
  }
}
