import AudioModule, { type AudioModuleType } from "./AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import * as Tone from "tone";

type FxDelayAnalogOptions = {
  delayTime: number;
  feedback: number;
  mix: number;
  modRate: number;
  modAmount: number;
};

const getDefaultOptions = (): FxDelayAnalogOptions => ({
  delayTime: 0.5,
  feedback: 0.5,
  mix: 0.5,
  modRate: 2,
  modAmount: 0.0025
});

export default class FxDelayAnalogModule extends AudioModule<FxDelayAnalogOptions> {
  private _inputNode: Tone.Gain;
  private _delay: Tone.Delay;
  private _feedbackSignal: Tone.Gain;
  private _distortion: Tone.Distortion;
  private _filter: Tone.Filter;
  private _modLFO: Tone.LFO;
  private _modGain: Tone.Gain;
  private _wetSignal: Tone.Gain;
  private _dryWetMixer: Tone.CrossFade;

  constructor(id: string, options?: FxDelayAnalogOptions) {
    super(id, options ?? getDefaultOptions());

    // todo: tweak these?
    const modRate = 2;
    const modAmount = 0.0025;

    // Initialize nodes
    this._inputNode = new Tone.Gain(1);
    this._delay = new Tone.Delay();
    this._feedbackSignal = new Tone.Gain(this._options.feedback);
    this._distortion = new Tone.Distortion(0.05);
    this._filter = new Tone.Filter(4000, "lowpass");
    this._modLFO = new Tone.LFO(modRate, -0.005, 0.005);
    this._modGain = new Tone.Gain(modAmount);
    this._wetSignal = new Tone.Gain(1);
    this._dryWetMixer = new Tone.CrossFade(0.5);
    
    this._inputNode.chain(this._delay, this._distortion, this._filter, this._feedbackSignal, this._delay, this._wetSignal);
    this._modLFO.chain(this._modGain, this._delay.delayTime);
    this._delay.delayTime.value = this._options.delayTime;
    this._inputNode.connect(this._dryWetMixer.a);
    this._wetSignal.connect(this._dryWetMixer.b);

    // Set wet level (mix)
    this._dryWetMixer.fade.value = this._options.mix;

    this._inputs = [
      new ModuleInput("input", this._inputNode),
      new ModuleInput("delayTime", this._delay.delayTime),
      new ModuleInput("feedback", this._feedbackSignal.gain),
      new ModuleInput("mix", this._dryWetMixer.fade),
    ];
    this._outputs = [new ModuleOutput("output", this._dryWetMixer)];
  }

  get type(): AudioModuleType {
    return "fx-delay-analog";
  }

  updateOptions(options: Partial<FxDelayAnalogOptions>): void {
    if (options.delayTime !== undefined) {
      this._options.delayTime = options.delayTime;
      this._delay.delayTime.value = options.delayTime;
    }
    if (options.feedback !== undefined) {
      this._options.feedback = options.feedback;
      this._feedbackSignal.gain.value = options.feedback;
    }
    if (options.mix !== undefined) {
      this._options.mix = options.mix;
      this._dryWetMixer.fade.value = options.mix;
    }
    if (options.modRate !== undefined) {
      this._options.modRate = options.modRate;
      this._modLFO.frequency.value = options.modRate;
    }
    if (options.modAmount !== undefined) {
      this._options.modAmount = options.modAmount;
      this._modGain.gain.value = options.modAmount;
    }
  }

  dispose(): void {
    this._modLFO.stop();

    this._inputNode.disconnect();
    this._delay.disconnect();
    this._distortion.disconnect();
    this._filter.disconnect();
    this._feedbackSignal.disconnect();
    this._delay.disconnect();
    this._wetSignal.disconnect();
    this._dryWetMixer.output.disconnect();
    this._modLFO.disconnect();
    this._modGain.disconnect();

    this._inputNode.dispose();
    this._delay.dispose();
    this._distortion.dispose();
    this._filter.dispose();
    this._feedbackSignal.dispose();
    this._delay.dispose();
    this._wetSignal.dispose();
    this._dryWetMixer.dispose();
    this._modLFO.dispose();
    this._modGain.dispose();
  }
}
