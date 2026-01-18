import * as Tone from "tone";

/**
 * lets the input signal pass through when the trig input is above 0
 * and silences the signal when the trig input is at or below 0
 */
export default class TrigGateNode extends Tone.ToneAudioNode {
  private _trigNode: Tone.WaveShaper;
  private _gainNode: Tone.Gain;

  constructor() {
    super();

    this._gainNode = new Tone.Gain(0);
    this._trigNode = new Tone.WaveShaper((x) => (x > 0 ? 1 : 0), 3);
    this._trigNode.connect(this._gainNode.gain);
  }

  get name(): string {
    return "TrigGateNode";
  }

  get input(): Tone.InputNode {
    return this._gainNode;
  }

  get output(): Tone.OutputNode {
    return this._gainNode;
  }

  get trigInput(): Tone.InputNode {
    return this._trigNode;
  }
}
