import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";
import {
  semitonesToFrequencyMult,
  centsToFrequencyMult,
} from "@/helpers/units";

export type SampleSlot = {
  number: number;
  name: string;
  url: string; // todo: storing blobs urls in memory?
  pitch: number;
  detune: number;
  gain: number;
};

export type SamplerModuleOptions = {
  sampleSlots: SampleSlot[];
  selectedSlotIndex: number;
};

const getDefaultOptions = (): SamplerModuleOptions => ({
  sampleSlots: Array.from({ length: 128 }, (_, i) => ({
    number: i,
    name: "empty",
    url: "",
    pitch: 0,
    detune: 0,
    gain: 0,
  })),
  selectedSlotIndex: 0,
});

export default class SamplerModule extends AudioModule<SamplerModuleOptions> {
  private _triggerInputNode: MessageInputNode;
  private _outputNode: Tone.Gain;
  private _players: Tone.Player[];

  constructor(id: string, options?: SamplerModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._players = new Array(128);
    this._outputNode = new Tone.Gain(1);

    this._triggerInputNode = new MessageInputNode(
      this.messageInputCallback.bind(this),
    );

    this._inputs = [new ModuleInput("trigger-sample", this._triggerInputNode)];
    this._outputs = [new ModuleOutput("output", this._outputNode)];
  }

  get type(): AudioModuleType {
    return "sampler";
  }

  messageInputCallback(time: number, data?: MessageBusDataType): void {
    for (let i = 0; i < this._players.length; i++) {
      if (this._players[i] && this._players[i]?.loaded) {
        this._players[i]?.start(time);
      }
    }
  }

  updateOptions(options: Partial<SamplerModuleOptions>): void {
    if (options.sampleSlots !== undefined) {
      for (let i = 0; i < options.sampleSlots.length; i++) {
        this._options.sampleSlots[i]! = options.sampleSlots[i]!;
        if (this._players[i] === undefined) {
          console.log("initializing new tone.player");
          this._players[i] = new Tone.Player(options.sampleSlots[i]);
          this._players[i]?.connect(this._outputNode);
        }

        this._players[i]!.playbackRate =
          semitonesToFrequencyMult(options.sampleSlots[i]!.pitch) *
          centsToFrequencyMult(options.sampleSlots[i]!.detune);

        this._players[i]!.volume.value = options.sampleSlots[i]!.gain;
        
        // todo: check if sample url changed and swap out
      }
    }
  }

  dispose(): void {}
}
