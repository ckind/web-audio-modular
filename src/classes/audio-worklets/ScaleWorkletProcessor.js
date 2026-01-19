
// scales an input value along the input range to the output range
function scaleValue(
  inputValue,
  inputMin,
  inputMax,
  outputMin,
  outputMax
) {
  return outputMin
    + (outputMax-outputMin) * ((inputValue-inputMin) / (inputMax-inputMin));
}

/**
 * scales an input value along the input range to the output range
 */
class ScaleWorkletProcessor extends AudioWorkletProcessor {
  // https://webaudio.github.io/web-audio-api/#AudioParamDescriptor
  static get parameterDescriptors () {
    return [{
      name: 'inputMin',
      defaultValue: -1,
      automationRate: "k-rate",
    }, {
      name: 'inputMax',
      defaultValue: 1,
      automationRate: "k-rate",
    }, {
      name: 'outputMin',
      defaultValue: -1,
      automationRate: "k-rate",
    }, {
      name: 'outputMax',
      defaultValue: 1,
      automationRate: "k-rate",
    }];
  }

  // https://webaudio.github.io/web-audio-api/#process
  process(inputs, outputs, parameters) {
    // Get the first input and output.
    const input = inputs[0];
    const output = outputs[0];

    // k-rate params only have one value per render quantum
    // todo: do extra variable assignments in process callback affect performance?
    const inputMin = parameters.inputMin[0];
    const inputMax = parameters.inputMax[0];
    const outputMin = parameters.outputMin[0];
    const outputMax = parameters.outputMax[0];

    // assume only one input channel and output channel for now
    const inputChannel = input[0];
    const outputChannel = output[0]

    if (!inputChannel || !outputChannel) return true;

    for (let i = 0; i < inputChannel.length; ++i) {
      outputChannel[i] = scaleValue(inputChannel[i], inputMin, inputMax, outputMin, outputMax);
    }

    return true;
  }
}

registerProcessor("scale-processor", ScaleWorkletProcessor);