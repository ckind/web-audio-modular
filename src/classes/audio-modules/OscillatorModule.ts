import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/factory/AudioModuleFactory";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";

type OscillatorModuleOptions = {
  frequency?: number;
};

export default class OscillatorModule extends AudioModule<OscillatorModuleOptions> {
  private _oscillatorNode: OscillatorNode;

  constructor(
    id: string,
    ctx: AudioContext,
    options?: OscillatorModuleOptions
  ) {
    super(id, ctx, options);
    this._oscillatorNode = ctx.createOscillator();
    this._oscillatorNode.frequency.value = options?.frequency ?? 440; // Default frequency
    this._oscillatorNode.start();

    this._outputs = [new ModuleOutput("output", this._oscillatorNode)];
    this._inputs = [
      new ModuleInput("frequency", this._oscillatorNode.frequency),
    ];
  }

  get type(): AudioModuleType {
    return "oscillator";
  }

  updateOptions(options: OscillatorModuleOptions): void {
    if (options.frequency !== undefined) {
      this._oscillatorNode.frequency.value = options.frequency;
    }
  }
}
