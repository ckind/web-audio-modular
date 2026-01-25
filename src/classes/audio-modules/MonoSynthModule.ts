import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageInputNode from "@/classes/MessageInputNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";
import {
  semitonesToFrequencyMult,
  centsToFrequencyMult,
  midiNoteToFrequency,
} from "@/helpers/units";

export type MonoSynthModuleOptions = {
  oscillator1Type: string;
  oscillator1Tuning: number;
  oscillator1Detune: number;
  oscillator1Volume: number;

  oscillator2Type: string;
  oscillator2Tuning: number;
  oscillator2Detune: number;
  oscillator2Volume: number;

  noiseType: Tone.NoiseType;
  noiseVolume: number;

  ampEnvAttack: number;
  ampEnvDecay: number;
  ampEnvSustain: number;
  ampEnvRelease: number;

  filterQ: number;
  filterType: BiquadFilterType;
  filterRolloff: Tone.FilterRollOff;
  filterFrequency: number;

  filterEnvAttack: number;
  filterEnvDecay: number;
  filterEnvSustain: number;
  filterEnvRelease: number;
  filterEnvAmount: number;
};

const getDefaultOptions = (): MonoSynthModuleOptions => ({
  oscillator1Type: "sawtooth",
  oscillator1Tuning: 0,
  oscillator1Detune: 0,
  oscillator1Volume: -12,

  oscillator2Type: "sawtooth",
  oscillator2Tuning: -12,
  oscillator2Detune: -5,
  oscillator2Volume: -12,

  noiseType: "pink",
  noiseVolume: -24,

  ampEnvAttack: 0.01,
  ampEnvDecay: 0.1,
  ampEnvSustain: 0.5,
  ampEnvRelease: 0.5,

  filterQ: 2,
  filterType: "lowpass",
  filterRolloff: -24,
  filterFrequency: 4000,

  filterEnvAttack: 0.01,
  filterEnvDecay: 0.1,
  filterEnvSustain: 0.5,
  filterEnvRelease: 0.5,
  filterEnvAmount: 0.2,
});

/**
 * 2 oscillator, 1 noise source mono synth with dedicated ADSR envelopes for filter and amp
 * there are also 3 modulation inputs that can be mapped to a variety of parameters
 */
export default class MonoSynthModule extends AudioModule<MonoSynthModuleOptions> {
  private _noiseNode: Tone.Noise;
  private _noiseVolumeNode: Tone.Volume;
  private _osc1Node: Tone.OmniOscillator<any>;
  private _osc1VolumeNode: Tone.Volume;
  private _osc2Node: Tone.OmniOscillator<any>;
  private _osc2VolumeNode: Tone.Volume;
  private _outputNode: Tone.Gain;
  private _filterNode: Tone.Filter;
  private _filterEnvNode: Tone.Envelope;
  private _filterEnvGainNode: Tone.Gain;
  private _ampEnvNode: Tone.AmplitudeEnvelope;

  private _midiInputNode: MessageInputNode;

  private _notesDown: Set<number> = new Set();
  private _sustainPedalDown: boolean = false;

  constructor(id: string, options?: MonoSynthModuleOptions) {
    super(id, options ?? getDefaultOptions());

    // nodes
    this._outputNode = new Tone.Gain(1);

    this._noiseNode = new Tone.Noise(this._options.noiseType);
    this._noiseVolumeNode = new Tone.Volume(this._options.noiseVolume);
    this._noiseNode.start();

    this._osc1Node = new Tone.OmniOscillator({
      type: "sawtooth",
      frequency: 0,
    });
    this._osc1VolumeNode = new Tone.Volume(this._options.oscillator1Volume);
    this._osc1Node.start();

    this._osc2Node = new Tone.OmniOscillator({
      type: "sawtooth",
      frequency: 0,
    });
    this._osc2VolumeNode = new Tone.Volume(this._options.oscillator2Volume);
    this._osc2Node.start();

    this._filterNode = new Tone.Filter({
      frequency: this._options.filterFrequency,
      type: this._options.filterType,
      rolloff: this._options.filterRolloff,
      Q: this._options.filterQ,
    });

    this._filterEnvNode = new Tone.Envelope({
      attack: this._options.filterEnvAttack,
      decay: this._options.filterEnvDecay,
      sustain: this._options.filterEnvSustain,
      release: this._options.filterEnvRelease,
    });
    this._filterEnvGainNode = new Tone.Gain(this._options.filterEnvAmount);

    this._ampEnvNode = new Tone.AmplitudeEnvelope({
      attack: this._options.ampEnvAttack,
      decay: this._options.ampEnvDecay,
      sustain: this._options.ampEnvSustain,
      release: this._options.ampEnvRelease,
    });

    // connections
    this._filterEnvNode.connect(this._filterEnvGainNode);
    this._filterEnvGainNode.connect(this._filterNode.frequency);

    this._osc1Node.connect(this._osc1VolumeNode);
    this._osc1VolumeNode.connect(this._filterNode);

    this._osc2Node.connect(this._osc2VolumeNode);
    this._osc2VolumeNode.connect(this._filterNode);

    this._noiseNode.connect(this._noiseVolumeNode);
    this._noiseVolumeNode.connect(this._filterNode);

    // this._filterEnvNode.connect(this._filterNode.frequency);
    this._filterNode.connect(this._ampEnvNode);
    this._ampEnvNode.connect(this._outputNode);

    // inputs and outputs
    this._midiInputNode = new MessageInputNode(
      this.midiInputCallback.bind(this),
    );

    this._inputs = [new ModuleInput("midi-input", this._midiInputNode)];
    this._outputs = [new ModuleOutput("output", this._outputNode)];
  }

  get type(): AudioModuleType {
    return "synth-mono";
  }

  midiInputCallback(time: number, data?: MessageBusDataType): void {
    if (!data || !(data instanceof Uint8Array) || data.length < 3) {
      return;
    }

    if ((data[0]! & 0xf0) === 0x90) {
      // note on message
      const noteNumber = data[1]!; // MIDI note number (0-127)
      const velocity = data[2]!; // MIDI velocity (0-127)
      const baseFrequency = midiNoteToFrequency(noteNumber);
      const osc1Frequency =
        baseFrequency *
        semitonesToFrequencyMult(this._options.oscillator1Tuning) *
        centsToFrequencyMult(this._options.oscillator1Detune);
      const osc2Frequency =
        baseFrequency *
        semitonesToFrequencyMult(this._options.oscillator2Tuning) *
        centsToFrequencyMult(this._options.oscillator2Detune);

      this._osc1Node.frequency.setValueAtTime(osc1Frequency, time);
      this._osc2Node.frequency.setValueAtTime(osc2Frequency, time);
      this._notesDown.add(noteNumber);
      this._ampEnvNode.triggerAttack(time, velocity / 127);
      this._filterEnvNode.triggerAttack(time, velocity / 127);
    } else if (
      !this._sustainPedalDown && // if sustain pedal is down, ignore note off messages
      (data[0]! & 0xf0) === 0x80 // note off message
    ) {
      const noteNumber = data[1]!; // MIDI note number (0-127)
      this._notesDown.delete(noteNumber);

      if (this._notesDown.size === 0) {
        this._ampEnvNode.triggerRelease(time);
        this._filterEnvNode.triggerRelease(time);
      }
    } else if ((data[0]! & 0xf0) === 0xb0 && data[1]! === 64) {
      const sustainOn = data[2]! >= 64;
      if (sustainOn) {
        this._sustainPedalDown = true;
      } else {
        this._sustainPedalDown = false;
        // When the sustain pedal is released, send note off messages
        // for any notes that are still marked as down
        // this is a mono synth, so we just trigger release once
        this._ampEnvNode.triggerRelease(time);
        this._filterEnvNode.triggerRelease(time);
        this._notesDown.clear();
      }
    }

    // console.log("Mono synth midi data received", data);
  }

  updateOptions(options: Partial<MonoSynthModuleOptions>): void {
    console.log(
      "Mono synth update options",
      "amp-env-attack",
      options.ampEnvAttack,
      "amp-env-decay",
      options.ampEnvDecay,
      "amp-env-sustain",
      options.ampEnvSustain,
      "amp-env-release",
      options.ampEnvRelease,
    );
    if (
      options.oscillator1Type !== undefined &&
      options.oscillator1Type !== this._options.oscillator1Type
    ) {
      this._osc1Node.type = options.oscillator1Type as Tone.ToneOscillatorType;
      this._options.oscillator1Type = options.oscillator1Type;
    }
    if (
      options.oscillator1Tuning !== undefined &&
      options.oscillator1Tuning !== this._options.oscillator1Tuning
    ) {
      this._options.oscillator1Tuning = options.oscillator1Tuning;
    }
    if (
      options.oscillator1Detune !== undefined &&
      options.oscillator1Detune !== this._options.oscillator1Detune
    ) {
      this._options.oscillator1Detune = options.oscillator1Detune;
    }
    if (
      options.oscillator1Volume !== undefined &&
      options.oscillator1Volume !== this._options.oscillator1Volume
    ) {
      this._osc1VolumeNode.volume.value = options.oscillator1Volume;
      this._options.oscillator1Volume = options.oscillator1Volume;
    }
    if (
      options.oscillator2Type !== undefined &&
      options.oscillator2Type !== this._options.oscillator2Type
    ) {
      this._osc2Node.type = options.oscillator2Type as Tone.ToneOscillatorType;
      this._options.oscillator2Type = options.oscillator2Type;
    }
    if (
      options.oscillator2Tuning !== undefined &&
      options.oscillator2Tuning !== this._options.oscillator2Tuning
    ) {
      this._options.oscillator2Tuning = options.oscillator2Tuning;
    }
    if (
      options.oscillator2Detune !== undefined &&
      options.oscillator2Detune !== this._options.oscillator2Detune
    ) {
      this._options.oscillator2Detune = options.oscillator2Detune;
    }
    if (
      options.oscillator2Volume !== undefined &&
      options.oscillator2Volume !== this._options.oscillator2Volume
    ) {
      this._osc2VolumeNode.volume.value = options.oscillator2Volume;
      this._options.oscillator2Volume = options.oscillator2Volume;
    }
    if (
      options.noiseType !== undefined &&
      options.noiseType !== this._options.noiseType
    ) {
      this._noiseNode.type = options.noiseType as Tone.NoiseType;
      this._options.noiseType = options.noiseType;
    }
    if (
      options.noiseVolume !== undefined &&
      options.noiseVolume !== this._options.noiseVolume
    ) {
      this._noiseVolumeNode.volume.value = options.noiseVolume;
      this._options.noiseVolume = options.noiseVolume;
    }
    if (
      options.ampEnvAttack !== undefined &&
      options.ampEnvAttack !== this._options.ampEnvAttack
    ) {
      this._ampEnvNode.attack = options.ampEnvAttack;
      this._options.ampEnvAttack = options.ampEnvAttack;
    }
    if (
      options.ampEnvDecay !== undefined &&
      options.ampEnvDecay !== this._options.ampEnvDecay
    ) {
      this._ampEnvNode.decay = options.ampEnvDecay;
      this._options.ampEnvDecay = options.ampEnvDecay;
    }
    if (
      options.ampEnvSustain !== undefined &&
      options.ampEnvSustain !== this._options.ampEnvSustain
    ) {
      this._ampEnvNode.sustain = options.ampEnvSustain;
      this._options.ampEnvSustain = options.ampEnvSustain;
    }
    if (
      options.ampEnvRelease !== undefined &&
      options.ampEnvRelease !== this._options.ampEnvRelease
    ) {
      this._ampEnvNode.release = options.ampEnvRelease;
      this._options.ampEnvRelease = options.ampEnvRelease;
    }
    if (
      options.filterQ !== undefined &&
      options.filterQ !== this._options.filterQ
    ) {
      this._filterNode.Q.value = options.filterQ;
      this._options.filterQ = options.filterQ;
    }
    if (
      options.filterType !== undefined &&
      options.filterType !== this._options.filterType
    ) {
      this._filterNode.type = options.filterType;
      this._options.filterType = options.filterType;
    }
    if (
      options.filterRolloff !== undefined &&
      options.filterRolloff !== this._options.filterRolloff
    ) {
      this._filterNode.rolloff = options.filterRolloff;
      this._options.filterRolloff = options.filterRolloff;
    }
    if (
      options.filterFrequency !== undefined &&
      options.filterFrequency !== this._options.filterFrequency
    ) {
      this._filterNode.frequency.value = options.filterFrequency;
      this._options.filterFrequency = options.filterFrequency;
    }
    if (
      options.filterEnvAttack !== undefined &&
      options.filterEnvAttack !== this._options.filterEnvAttack
    ) {
      this._filterEnvNode.attack = options.filterEnvAttack;
      this._options.filterEnvAttack = options.filterEnvAttack;
    }
    if (
      options.filterEnvDecay !== undefined &&
      options.filterEnvDecay !== this._options.filterEnvDecay
    ) {
      this._filterEnvNode.decay = options.filterEnvDecay;
      this._options.filterEnvDecay = options.filterEnvDecay;
    }
    if (
      options.filterEnvSustain !== undefined &&
      options.filterEnvSustain !== this._options.filterEnvSustain
    ) {
      this._filterEnvNode.sustain = options.filterEnvSustain;
      this._options.filterEnvSustain = options.filterEnvSustain;
    }
    if (
      options.filterEnvRelease !== undefined &&
      options.filterEnvRelease !== this._options.filterEnvRelease
    ) {
      this._filterEnvNode.release = options.filterEnvRelease;
      this._options.filterEnvRelease = options.filterEnvRelease;
    }
    if (
      options.filterEnvAmount !== undefined &&
      options.filterEnvAmount !== this._options.filterEnvAmount
    ) {
      this._options.filterEnvAmount = options.filterEnvAmount;
    }
  }

  dispose(): void {
    this._noiseNode.stop();
    this._noiseNode.disconnect();
    this._noiseNode.dispose();
    this._noiseVolumeNode.disconnect();
    this._noiseVolumeNode.dispose();

    this._osc1Node.stop();
    this._osc1Node.disconnect();
    this._osc1Node.dispose();
    this._osc1VolumeNode.disconnect();
    this._osc1VolumeNode.dispose();

    this._osc2Node.stop();
    this._osc2Node.disconnect();
    this._osc2Node.dispose();
    this._osc2VolumeNode.disconnect();
    this._osc2VolumeNode.dispose();

    this._ampEnvNode.disconnect();
    this._ampEnvNode.dispose();

    this._filterNode.disconnect();
    this._filterNode.dispose();

    this._outputNode.disconnect();
    this._outputNode.dispose();
  }
}
