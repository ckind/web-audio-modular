import AudioModule from "./AudioModule";
import type { AudioModuleType } from "./factory/AudioModuleFactory";
import ModuleOutput from "./ModuleOutput";

export default class OscillatorModule extends AudioModule {
  private _oscillatorNode: OscillatorNode;

  constructor(ctx: AudioContext) {
    super(ctx);
    this._oscillatorNode = ctx.createOscillator();
    this._oscillatorNode.frequency.value = 440; // Default frequency
    this._oscillatorNode.start();

    this._outputs = [new ModuleOutput("output", this._oscillatorNode)];
  }

  get type(): AudioModuleType {
    return "oscillator";
  }
}
