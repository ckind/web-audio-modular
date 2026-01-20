import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import SamplerPlusNode from "@/classes/audio-nodes/SamplerPlusNode";

type SamplerPlusModuleOptions = {
  playbackRate: number;
  sharedChannelData?: Float32Array<SharedArrayBuffer>[];
  startPosition: number;
};

const getDefaultOptions = (): SamplerPlusModuleOptions => ({
  playbackRate: 1.0,
  startPosition: 0,
});

export default class SamplerPlusModule extends AudioModule<SamplerPlusModuleOptions> {
  private _samplerPlusNode: SamplerPlusNode;
  private _playInputNode: MessageInputNode;
  private _playbackRateInputNode: Tone.Signal;
  private _toggle: boolean = true;

  constructor(id: string, options?: SamplerPlusModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._samplerPlusNode = new SamplerPlusNode(
      options?.sharedChannelData
        ? new AudioBuffer({
            length: options.sharedChannelData[0]!.length,
            numberOfChannels: options.sharedChannelData.length,
            sampleRate: Tone.getContext().sampleRate,
          })
        : new AudioBuffer({
            length: 1,
            numberOfChannels: 1,
            sampleRate: Tone.getContext().sampleRate,
          }),
    );

    this._playInputNode = new MessageInputNode(
      this._playInputCallback.bind(this),
    );
    this._playbackRateInputNode = new Tone.Signal(this._options.playbackRate);
    this._playbackRateInputNode.connect(this._samplerPlusNode.playbackRate);

    this._inputs = [
      new ModuleInput("play", this._playInputNode),
      new ModuleInput("playback-rate", this._playbackRateInputNode),
    ];
    this._outputs = [new ModuleOutput("sampler-output", this._samplerPlusNode)];
  }

  get type(): AudioModuleType {
    return "sampler-plus";
  }

  private _playInputCallback(data: any): void {
    console.log("SamplerPlusModule play input received data:", data);
    if (this._toggle) {
      console.log("Playing sampler");
      this._samplerPlusNode.setBufferPos(this._options.startPosition);
      this._samplerPlusNode.play();
    } else {
      this._samplerPlusNode.pause();
    }

    this._toggle = !this._toggle;
  }

  updateOptions(options: Partial<SamplerPlusModuleOptions>): void {
    console.log("Updating SamplerPlusModule options:", options);
    if (options.sharedChannelData) {
      this._samplerPlusNode.setBufferChannels(options.sharedChannelData);
      this._options.sharedChannelData = options.sharedChannelData;
    }
    if (options.startPosition !== undefined) {
      this._options.startPosition = options.startPosition;
    }
  }

  dispose(): void {
    this._samplerPlusNode.dispose();
  }
}
