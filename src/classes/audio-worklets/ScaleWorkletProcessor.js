// scales an input value along the input range to the output range
function scaleLinear(inputValue, inputMin, inputMax, outputMin, outputMax) {
  return (
    outputMin +
    (outputMax - outputMin) * ((inputValue - inputMin) / (inputMax - inputMin))
  );
}

/**
 * scale an input value along the input range to the output range
 * and applies the following curve
 * see: https://docs.cycling74.com/legacy/max8/refpages/scale
 * ((x-in_low)/(in_high-in_low) == 0)
 *    ? out_low
 *    : (((x-in_low)/(in_high-in_low)) > 0)
 *      ? (out_low + (out_high-out_low) * ((x-in_low)/(in_high-in_low))^exp)
 *      : ( out_low + (out_high-out_low) * -((((-x+in_low)/(in_high-in_low)))^(exp)))
 **/
// prettier-ignore
function scaleCurve(x, in_low, in_high, out_low, out_high, exp) {
  return (x - in_low) / (in_high - in_low) == 0
    ? out_low
    : (x - in_low) / (in_high - in_low) > 0
      ? out_low + (out_high - out_low) * Math.pow((x - in_low) / (in_high - in_low), exp)
      : out_low + (out_high - out_low) * -Math.pow((-x + in_low) / (in_high - in_low), exp);
}
/**
 * scales an input value along the input range to the output range
 */
class ScaleWorkletProcessor extends AudioWorkletProcessor {
  // https://webaudio.github.io/web-audio-api/#AudioParamDescriptor
  static get parameterDescriptors() {
    return [
      {
        name: "inputMin",
        defaultValue: -1,
        automationRate: "k-rate",
      },
      {
        name: "inputMax",
        defaultValue: 1,
        automationRate: "k-rate",
      },
      {
        name: "outputMin",
        defaultValue: -1,
        automationRate: "k-rate",
      },
      {
        name: "outputMax",
        defaultValue: 1,
        automationRate: "k-rate",
      },
      {
        name: "curveAmount",
        defaultValue: 1,
        automationRate: "k-rate",
      },
    ];
  }

  constructor(options) {
    super(options);

    this._disposed = false;
    this.port.onmessage = (event) => {
      // console.log("received message from node:", event.data);
      this.processMessageData(event.data);
    };
  }

  processMessageData(data) {
    if (data.command === "dispose") {
      this._disposed = true;
    }
  }

  // https://webaudio.github.io/web-audio-api/#process
  process(inputs, outputs, parameters) {
    if (this._disposed) return false;

    // Get the first input and output.
    const input = inputs[0];
    const output = outputs[0];

    // k-rate params only have one value per render quantum
    // todo: do extra variable assignments in process callback affect performance?
    const inputMin = parameters.inputMin[0];
    const inputMax = parameters.inputMax[0];
    const outputMin = parameters.outputMin[0];
    const outputMax = parameters.outputMax[0];
    const curveAmount = parameters.curveAmount[0];

    // assume only one input channel and output channel for now
    const inputChannel = input[0];
    const outputChannel = output[0];

    if (!inputChannel || !outputChannel) return true;

    for (let i = 0; i < inputChannel.length; ++i) {
      if (curveAmount === 0) {
        outputChannel[i] = scaleLinear(
          inputChannel[i],
          inputMin,
          inputMax,
          outputMin,
          outputMax,
        );
      } else {
        outputChannel[i] = scaleCurve(
          inputChannel[i],
          inputMin,
          inputMax,
          outputMin,
          outputMax,
          curveAmount,
        );
      }
    }

    return true;
  }
}

registerProcessor("scale-worklet-processor", ScaleWorkletProcessor);
