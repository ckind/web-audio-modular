import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";

type ADSRAmplitudeModuleOptions = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

const getDefaultOptions = (): ADSRAmplitudeModuleOptions => ({
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

export default class ADSRAmplitudeModule extends AudioModule<ADSRAmplitudeModuleOptions> {
  private _ampEnvNode: Tone.AmplitudeEnvelope;

  constructor(id: string, options?: ADSRAmplitudeModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._ampEnvNode = new Tone.AmplitudeEnvelope({
      attack: this._options.attack,
      decay: this._options.decay,
      sustain: this._options.sustain,
      release: this._options.release,
    });

    this._outputs = [new ModuleOutput("amp-output", this._ampEnvNode)];
    this._inputs = [
      new ModuleInput("amp-input", this._ampEnvNode),
      new ModuleInput(
        "trigger-attack",
        new MessageInputNode(this.triggerAttackCallback.bind(this)),
      ),
      new ModuleInput(
        "trigger-release",
        new MessageInputNode(this.triggerReleaseCallback.bind(this)),
      ),
    ];
  }

  get type(): AudioModuleType {
    return "adsr-amplitude";
  }

  triggerAttackCallback(time: number, data: any) {
    if (data !== undefined) {
      if (isNormalRange(data)) {
        this._ampEnvNode.triggerAttack(time, data);
        return;
      } else if (isMidiRange(data)) {
        const normalizedValue = data / 127;
        this._ampEnvNode.triggerAttack(time, normalizedValue);
        return;
      }
    }
    this._ampEnvNode.triggerAttack(time, data);
  }

  triggerReleaseCallback(time: number, data: any) {
    this._ampEnvNode.triggerRelease(time);
  }

  updateOptions(options: Partial<ADSRAmplitudeModuleOptions>): void {
    if (options.attack !== undefined) {
      this._ampEnvNode.attack = options.attack;
      this._options.attack = options.attack;
    }
    if (options.decay !== undefined) {
      this._ampEnvNode.decay = options.decay;
      this._options.decay = options.decay;
    }
    if (options.sustain !== undefined) {
      this._ampEnvNode.sustain = options.sustain;
      this._options.sustain = options.sustain;
    }
    if (options.release !== undefined) {
      this._ampEnvNode.release = options.release;
      this._options.release = options.release;
    }
  }

  dispose(): void {
    this._ampEnvNode.dispose();
  }
}
