import * as Tone from "tone";

export default class PowCurveWorkletNode extends Tone.ToneAudioNode {
  private _workletNode: AudioWorkletNode;

  constructor(options: { min: number; max: number; base: number }) {
    super(Tone.getContext());
    this._workletNode = new AudioWorkletNode(
      Tone.getContext().rawContext,
      "pow-curve-worklet-processor",
      {
        parameterData: options,
      },
    );
  }

  get name() {
    return "PowCurveWorkletNode";
  }

  get input() {
    return this._workletNode;
  }

  get output() {
    return this._workletNode;
  }

  get min() {
    return this._workletNode.parameters.get("min")!;
  }

  get max() {
    return this._workletNode.parameters.get("max")!;
  }

  get base() {
    return this._workletNode.parameters.get("base")!;
  }

  dispose(): this {
    this._workletNode.disconnect();
    this._workletNode.port.postMessage({ command: "dispose" });
    return this;
  }
}
