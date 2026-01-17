import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import AudioParamNode from "@/classes/AudioParamNode";

type OscillatorModuleOptions = {
  frequency: number;
  type: OscillatorType;
};

const getDefaultOptions = (): OscillatorModuleOptions => ({
  frequency: 440,
  type: "sine",
});

export default class OscillatorModule extends AudioModule<OscillatorModuleOptions> {
  private _oscillatorNode: OscillatorNode;

  constructor(
    id: string,
    ctx: AudioContext,
    options?: OscillatorModuleOptions,
  ) {
    super(id, ctx, options ?? getDefaultOptions());

    this._oscillatorNode = ctx.createOscillator();
    this._oscillatorNode.type = this._options.type;
    this._oscillatorNode.frequency.value = this._options.frequency; // Default frequency
    this._oscillatorNode.start();

    this._outputs = [
      new ModuleOutput("osc-signal-output", this._oscillatorNode),
    ];
    this._inputs = [
      new ModuleInput(
        "frequency-param",
        new AudioParamNode(ctx, this._oscillatorNode.frequency),
      ),
    ];
  }

  get type(): AudioModuleType {
    return "oscillator";
  }

  updateOptions(options: Partial<OscillatorModuleOptions>): void {
    if (options.frequency !== undefined) {
      this._oscillatorNode.frequency.value = options.frequency;
      this._options.frequency = options.frequency;
    }
    if (options.type !== undefined) {
      this._oscillatorNode.type = options.type;
      this._options.type = options.type;
    }
  }

  dispose(): void {
    this._oscillatorNode.stop();
  }
}
