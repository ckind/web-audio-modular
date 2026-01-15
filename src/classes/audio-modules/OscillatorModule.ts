import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/factory/AudioModuleFactory";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";

type OscillatorModuleOptions = {
  frequency: number;
};

const getDefaultOptions = (): OscillatorModuleOptions => ({
  frequency: 440,
});

export default class OscillatorModule extends AudioModule<OscillatorModuleOptions> {
  private _oscillatorNode: OscillatorNode;

  constructor(
    id: string,
    ctx: AudioContext,
    options?: OscillatorModuleOptions
  ) {
    super(id, ctx, options ?? getDefaultOptions());
    
    this._oscillatorNode = ctx.createOscillator();
    this._oscillatorNode.frequency.value = this._options.frequency; // Default frequency
    this._oscillatorNode.start();

    this._outputs = [new ModuleOutput("output", this._oscillatorNode)];
    this._inputs = [
      new ModuleInput("frequency", this._oscillatorNode.frequency),
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
  }

  dispose(): void {
    this._oscillatorNode.stop();
  }
}
