import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import { da } from "vuetify/locale";

type ADSREnvelopeModuleOptions = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

const getDefaultOptions = (): ADSREnvelopeModuleOptions => ({
  attack: 0.01,
  decay: 0.2,
  sustain: 0.5,
  release: 1,
});

const isNormalRange = (value: any): value is number => {
  return typeof value === "number" && value >= 0 && value <= 1;
};

const isMidiRange = (value: any): value is number => {
  return Number.isInteger(value) && value >= 0 && value <= 127;
}

export default class ADSREnvelopeModule extends AudioModule<ADSREnvelopeModuleOptions> {
  private _envelopeNode: Tone.Envelope;

  constructor(id: string, options?: ADSREnvelopeModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._envelopeNode = new Tone.Envelope({
      attack: this._options.attack,
      decay: this._options.decay,
      sustain: this._options.sustain,
      release: this._options.release,
    });

    this._outputs = [new ModuleOutput("envelope-output", this._envelopeNode)];
    this._inputs = [
      new ModuleInput(
        "trigger-attack",
        new MessageInputNode(this.triggerAttackCallback.bind(this)),
      ),
      new ModuleInput(
        "trigger-release",
        new MessageInputNode(this.triggerReleaseCallback.bind(this)),
      )
    ];
  }

  get type(): AudioModuleType {
    return "adsr-envelope";
  }

  triggerAttackCallback(time: number, data: any) {
    if (data !== undefined) {
      if (isNormalRange(data)) {
        this._envelopeNode.triggerAttack(time, data);
        return;
      } else if (isMidiRange(data)) {
        const normalizedValue = data / 127;
        this._envelopeNode.triggerAttack(time, normalizedValue);
        return;
      }
    }

    this._envelopeNode.triggerAttack(time);
  }

  triggerReleaseCallback(time: number, data: any) {
    this._envelopeNode.triggerRelease(time);
  }

  updateOptions(options: Partial<ADSREnvelopeModuleOptions>): void {
    if (options.attack !== undefined) {
      this._envelopeNode.attack = options.attack;
      this._options.attack = options.attack;
    }
    if (options.decay !== undefined) {
      this._envelopeNode.decay = options.decay;
      this._options.decay = options.decay;
    }
    if (options.sustain !== undefined) {
      this._envelopeNode.sustain = options.sustain;
      this._options.sustain = options.sustain;
    }
    if (options.release !== undefined) {
      this._envelopeNode.release = options.release;
      this._options.release = options.release;
    }
  }

  dispose(): void {
    this._envelopeNode.dispose();
  }
}
