import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

export type GrainPlayerModuleOptions = {
  audioUrl: string;
  grainSize: number;
  loopStart: number;
  loopEnd: number;
  playbackRate: number;
  overlap: number;
};

const getDefaultOptions = (): GrainPlayerModuleOptions => ({
  audioUrl: "",
  grainSize: 1,
  loopStart: 0,
  loopEnd: 0,
  playbackRate: 1,
  overlap: 0,
});

export default class GrainPlayerModule extends AudioModule<GrainPlayerModuleOptions> {
  private _grainPlayer: Tone.GrainPlayer;
  private _startInputNode: MessageInputNode;

  constructor(id: string, options?: GrainPlayerModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._grainPlayer = new Tone.GrainPlayer(this._options.audioUrl);

    this._grainPlayer.grainSize = 0.1;

    this._startInputNode = new MessageInputNode(
      this.startInputCallback.bind(this),
    );

    this._inputs = [new ModuleInput("start", this._startInputNode)];
    this._outputs = [new ModuleOutput("output", this._grainPlayer)];
  }

  get type(): AudioModuleType {
    return "player";
  }

  startInputCallback(time: number, data?: MessageBusDataType): void {
    if (this._grainPlayer.loaded) {
      this._grainPlayer.start(time);
    }
  }

  updateOptions(options: Partial<GrainPlayerModuleOptions>): void {
    if (options.audioUrl !== undefined && options.audioUrl != "") {
      this._options.audioUrl = options.audioUrl;
      this._grainPlayer.buffer.load(options.audioUrl);
    }
  }

  dispose(): void {
    this._grainPlayer.dispose();
  }
}
