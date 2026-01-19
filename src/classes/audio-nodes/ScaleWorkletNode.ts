export default class ScaleWorkletNode extends AudioWorkletNode {
  constructor(
    context: BaseAudioContext,
    options: {
      inputMin: number;
      inputMax: number;
      outputMin: number;
      outputMax: number;
    },
  ) {
    super(context, "scale-processor", {
      parameterData: options,
    });
  }

  get inputMin() {
    return this.parameters.get("inputMin")!;
  }

  get inputMax() {
    return this.parameters.get("inputMax")!;
  }

  get outputMin() {
    return this.parameters.get("outputMin")!;
  }

  get outputMax() {
    return this.parameters.get("outputMax")!;
  }
}