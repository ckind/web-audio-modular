function logBaseN(n, x) {
  return Math.log(x) / Math.log(n);
}
function powBaseN(n, x) {
  return Math.pow(n, x);
}

/**
 * maps the input value along an n^x curve from min to max
 * where x is the sampled value of the signal and n is the given base
 * works best with min > 1 and max > 1
 * clamps values outside of [min, max]
 */
class PowCurveWorkletProcessor extends AudioWorkletProcessor {
  // https://webaudio.github.io/web-audio-api/#AudioParamDescriptor
  static get parameterDescriptors() {
    return [
      {
        name: "min",
        defaultValue: 1,
        automationRate: "k-rate",
      },
      {
        name: "max",
        defaultValue: 100,
        automationRate: "k-rate",
      },
      {
        name: "base",
        defaultValue: 2,
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
    // todo: these could be a-rate
    const min = parameters.min[0];
    const max = parameters.max[0];
    const n = parameters.base[0];

    const range = max - min;
    const logMin = logBaseN(n, min);
    const logMax = logBaseN(n, max);
    const logRange = logMax - logMin;

    // assume only one input channel and output channel for now
    const inputChannel = input[0];
    const outputChannel = output[0];

    if (!inputChannel || !outputChannel) return true;

    for (let i = 0; i < inputChannel.length; ++i) {
      const t = (inputChannel[i] - min) / range;
      outputChannel[i] = powBaseN(n, t * logRange + logMin);
    }

    return true;
  }
}

registerProcessor("pow-curve-worklet-processor", PowCurveWorkletProcessor);
