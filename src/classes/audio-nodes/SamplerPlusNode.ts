import * as Tone from "tone";

export default class SamplerPlusNode extends Tone.ToneAudioNode {
  private _workletNode: AudioWorkletNode;
  private _sharedChannelData: Float32Array<SharedArrayBuffer>[];
  private _bufferPos = 0;
  private _buffer: AudioBuffer | null = null;
  private _looping = false;
  private _loopStart = 0;
  private _loopEnd = 0;

  private handleMessageData(data: any) {
    switch (data.command) {
      case "updateBufferPos":
        this._bufferPos = data.payload;
        break;
    }
  }

  constructor(buffer: AudioBuffer) {
    super(Tone.getContext());

    const sharedArrayBuffers = Array.from(
      { length: buffer.numberOfChannels },
      () => {
        return new SharedArrayBuffer(
          Float32Array.BYTES_PER_ELEMENT * buffer.length,
        );
      },
    );

    this._sharedChannelData = sharedArrayBuffers.map((sab, c) => {
      const channelData = new Float32Array(sab);
      channelData.set(buffer.getChannelData(c));
      return channelData;
    });

    this._workletNode = new AudioWorkletNode(
      Tone.getContext().rawContext,
      "sampler-plus-worklet-processor",
      {
        processorOptions: {
          bufferChannels: this._sharedChannelData,
        },
        outputChannelCount: [2],
      },
    );

    this._buffer = buffer;

    // Handles updated values from AudioWorkletProcessor
    this._workletNode.port.onmessage = (event) => {
      this.handleMessageData(event.data);
    };
    this._workletNode.port.start();
  }

  get name(): string {
    return "SamplerPlusNode";
  }

  get input() {
    return this._workletNode;
  }

  get output() {
    return this._workletNode;
  }

  get playbackRate() {
    return this._workletNode.parameters.get("playbackRate")!;
  }

  get loop() {
    return this._looping;
  }

  set loop(value: boolean) {
    if (value) {
      this._workletNode.port.postMessage({ command: "loopOn" });
    } else {
      this._workletNode.port.postMessage({ command: "loopOff" });
    }
    this._looping = value;
  }

  get loopStart() {
    return this._loopStart;
  }

  set loopStart(value: number) {
    this._workletNode.port.postMessage({
      command: "setLoopStart",
      payload: value,
    });
    this._loopStart = value;
  }

  get loopEnd() {
    return this._loopEnd;
  }

  set loopEnd(value: number) {
    this._workletNode.port.postMessage({
      command: "setLoopEnd",
      payload: value,
    });
    this._loopEnd = value;
  }

  get buffer() {
    return this._buffer;
  }

  get bufferPos() {
    return this._bufferPos;
  }

  get elapsedTimeSeconds() {
    return this._bufferPos / this.context.sampleRate;
  }

  get totalTimeSeconds() {
    return this._buffer!.duration;
  }

  play(): void {
    this._workletNode.port.postMessage({ command: "play" });
  }

  pause(): void {
    this._workletNode.port.postMessage({ command: "pause" });
  }

  restart(): void {
    this._workletNode.port.postMessage({ command: "restart" });
  }

  setBufferPos(pos: number): void {
    this._workletNode.port.postMessage({
      command: "setBufferPos",
      payload: pos,
    });
  }

  shiftBufferPos(delta: number): void {
    this._workletNode.port.postMessage({
      command: "shiftBufferPos",
      payload: delta,
    });
  }

  setLoopPoints(start: number, end: number) {
    this._workletNode.port.postMessage({
      command: "setLoopPoints",
      payload: { start, end },
    });
  }

  setBufferChannels(channels: Float32Array<SharedArrayBuffer>[]): void {
    this._workletNode.port.postMessage({
      command: "setBufferChannels",
      payload: channels,
    });
  }

  dispose() {
    this._workletNode.port.postMessage({ command: "dispose" });
    return this;
  }
}
