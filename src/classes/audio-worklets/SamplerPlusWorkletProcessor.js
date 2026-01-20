class SamplerPlusWorkletProcessor extends AudioWorkletProcessor {
  // https://webaudio.github.io/web-audio-api/#AudioParamDescriptor
  static get parameterDescriptors() {
    return [
      {
        name: "playbackRate",
        defaultValue: 1.0,
        automationRate: "a-rate",
      },
    ];
  }

  constructor(options) {
    super(options);
    this._bufferChannels = [];
    this._playing = false;
    this._bufferPos = 0;
    this._disposed = false;
    this._loopStart = 0;
    this._loopEnd = 0;
    this._loop = false;

    if (options.processorOptions && options.processorOptions.bufferChannels) {
      this._bufferChannels = options.processorOptions.bufferChannels;
    }

    this.port.onmessage = (event) => {
      // console.log("received message from node:", event.data);
      this.processMessageData(event.data);
    };
  }

  processMessageData(data) {
    if (data.command) {
      switch (data.command) {
        // todo: this is not very precise in terms of timing
        case "play":
          console.log("SamplerPlusWorkletProcessor: play()");
          this.play();
          break;
        case "pause":
          console.log("SamplerPlusWorkletProcessor: pause()");
          this.pause();
          break;
        case "restart":
          this.restart();
          break;
        case "setBufferChannels":
          if (data.payload !== undefined) {
            this._bufferChannels = data.payload;
            // reset loop end to buffer length if needed
            if (this._loopEnd > this._bufferChannels[0].length) {
              this._loopEnd = this._bufferChannels[0].length;
            }
          }
          break;
        case "setBufferPos":
          if (data.payload !== undefined) {
            this._bufferPos = data.payload;
          }
          break;
        case "shiftBufferPos":
          if (data.payload !== undefined) {
            this._bufferPos = Math.min(
              Math.max(this._bufferPos + data.payload, 0),
              this._bufferChannels[0].length - 1,
            );
          }
          break;
        case "dispose":
          this._disposed = true;
          break;
        case "setLoopStart":
          if (data.payload != undefined) {
            this._loopStart = data.payload;
          }
          break;
        case "setLoopEnd":
          if (data.payload != undefined) {
            this._loopEnd = data.payload;
          }
          break;
        case "loopOn":
          this._loop = true;
          break;
        case "loopOff":
          this._loop = false;
          break;
      }
    }
  }

  play() {
    this._playing = true;
  }

  pause() {
    this._playing = false;
  }

  restart() {
    this._bufferPos = 0;
  }

  writeToOutput(bufferChannels, outputChannels, s, bufferPos) {
    for (let c = 0; c < outputChannels.length; c++) {
      if (c < bufferChannels.length && s < bufferChannels[c].length) {
        outputChannels[c][s] = this.interpolate(bufferChannels[c], bufferPos);
      }
    }
  }

  interpolate(bufferChannel, bufferPos) {
    // linear interpolation for now
    // could use different algo for better audio quality

    const i = Math.floor(bufferPos);
    const f = bufferPos - i;
    const next = Math.min(i + 1, bufferChannel.length - 1); // todo: how else to handle last sample value?
    return bufferChannel[i] * (1 - f) + bufferChannel[next] * f;
  }

  // https://webaudio.github.io/web-audio-api/#process
  process(inputs, outputs, parameters) {
    if (this._disposed) return false;
    if (!this._bufferChannels || this._bufferChannels.length < 1) return true;

    if (this._playing && outputs.length > 0) {
      const quantumLength = outputs[0][0].length;
      const bufferLength = this._bufferChannels[0].length;

      let s = 0;
      while (s < quantumLength && this._bufferPos < bufferLength) {
        const playbackRate =
          parameters.playbackRate.length === 1
            ? parameters.playbackRate[0]
            : parameters.playbackRate[s];

        for (let o = 0; o < outputs.length; o++) {
          this.writeToOutput(
            this._bufferChannels,
            outputs[o],
            s,
            this._bufferPos,
          );
        }

        if (this._loop && this._bufferPos >= this._loopEnd) {
          this._bufferPos = this._loopStart;
        } else {
          this._bufferPos += playbackRate;
        }

        s++;
      }
    }

    // todo: send buffer position updates to the node for UI updates?
    // this.port.postMessage({
    //   command: "updateBufferPos",
    //   payload: this._bufferPos,
    // });

    return true;
  }
}

registerProcessor(
  "sampler-plus-worklet-processor",
  SamplerPlusWorkletProcessor,
);
