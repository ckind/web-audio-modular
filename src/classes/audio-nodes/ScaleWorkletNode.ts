import * as Tone from "tone";

export default class ScaleWorkletNode extends Tone.ToneAudioNode {
  private _workletNode: AudioWorkletNode;

  constructor(options: {
    inputMin: number;
    inputMax: number;
    outputMin: number;
    outputMax: number;
  }) {
    super(Tone.getContext());
    this._workletNode = new AudioWorkletNode(
      Tone.getContext().rawContext,
      "scale-worklet-processor",
      {
        parameterData: options,
      },
    );
  }

  get name() {
    return "ScaleWorkletNode";
  }

  get input() {
    return this._workletNode;
  }

  get output() {
    return this._workletNode;
  }

  get inputMin() {
    return this._workletNode.parameters.get("inputMin")!;
  }

  get inputMax() {
    return this._workletNode.parameters.get("inputMax")!;
  }

  get outputMin() {
    return this._workletNode.parameters.get("outputMin")!;
  }

  get outputMax() {
    return this._workletNode.parameters.get("outputMax")!;
  }

  dispose(): this {
    this._workletNode.disconnect();
    this._workletNode.port.postMessage({ type: "dispose" });
    return this;
  }
}
