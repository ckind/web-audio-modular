import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";

type NoiseModuleOptions = {
  type: Tone.NoiseType;
};

const getDefaultOptions = (): NoiseModuleOptions => ({
  type: "white",
});

export default class NoiseModule extends AudioModule<NoiseModuleOptions> {
  private _noiseNode: Tone.Noise;

  constructor(id: string, options?: NoiseModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._noiseNode = new Tone.Noise(this._options.type);
    this._noiseNode.start();

    this._outputs = [new ModuleOutput("noise-signal-output", this._noiseNode)];
    this._inputs = [
      new ModuleInput(
        "noise-type",
        new MessageInputNode(this.noiseTypeCallback.bind(this)),
      ),
    ];
  }

  get type(): AudioModuleType {
    return "noise";
  }

  noiseTypeCallback(time: number, data: any) {
    // todo: validate type?
    // todo: seems like tone/web audio api is not actually able to change
    this._noiseNode.type = data;
    this._options.type = data;
  }

  updateOptions(options: Partial<NoiseModuleOptions>): void {
    if (options.type !== undefined && options.type !== this._options.type) {
      this._noiseNode.type = options.type;
      this._options.type = options.type;
    }
  }

  dispose(): void {
    this._noiseNode.stop();
    this._noiseNode.dispose();
  }
}
