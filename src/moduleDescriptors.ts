import type { ConnectionType } from "./types/connectionTypes";

export type ModuleDescriptor = {
  title: string;
  type: string;
  GUIComponent?: string;
  categories: string[];
  description?: string;
  inputDescriptions?: InputDescriptor[];
  outputDescriptions?: OutputDescriptor[];
};

export type InputDescriptor = {
  name: string;
  description: string;
  type: ConnectionType;
};

export type OutputDescriptor = {
  name: string;
  description: string;
  type: ConnectionType;
};

export const availableModules: ModuleDescriptor[] = [
  {
    title: "osc",
    type: "osc",
    categories: ["source", "signal"],
    description:
      "Generates periodic waveforms (sine, square, triangle, sawtooth) at a specified frequency.",
    inputDescriptions: [
      {
        name: "frequency",
        description: "Frequency of the oscillator in Hz",
        type: "signal",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Generated waveform signal",
        type: "signal",
      },
    ],
  },
  {
    title: "osc-pulse",
    type: "osc-pulse",
    categories: ["source", "signal"],
    description: "Generates pulse waveform with a modulatable pulse width.",
    inputDescriptions: [
      {
        name: "frequency",
        description: "Frequency of the oscillator in Hz",
        type: "signal",
      },
      {
        name: "pulse-width",
        description: "the width of the pulse waveform",
        type: "signal",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Generated waveform signal",
        type: "signal",
      },
    ],
  },
  {
    title: "osc-fm",
    type: "osc-fm",
    categories: ["source", "signal"],
    description: "Generates waveform using frequency modulation synthesis.",
    inputDescriptions: [
      {
        name: "frequency",
        description: "Carrier frequency of the oscillator in Hz",
        type: "signal",
      },
      {
        name: "modulation-index",
        description:
          "Modulation index (affects the amount of frequency modulation)",
        type: "signal",
      },
      {
        name: "modulation-rate",
        description:
          "Modulation rate (frequency of the modulating oscillator in Hz)",
        type: "signal",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Generated waveform signal",
        type: "signal",
      },
    ],
  },
  {
    title: "constant-signal",
    type: "constant-signal",
    categories: ["source", "signal"],
    description: "Outputs a constant signal value.",
    inputDescriptions: [],
    outputDescriptions: [
      {
        name: "output",
        description: "Constant signal value",
        type: "signal",
      },
    ],
  },
  {
    title: "speaker-output",
    type: "speaker-output",
    categories: ["output", "signal"],
    description: "Outputs audio signal to the system speakers.",
    inputDescriptions: [
      { name: "input", description: "Audio signal to output", type: "signal" },
    ],
    outputDescriptions: [],
  },
  {
    title: "gain",
    type: "gain",
    categories: ["signal-operator", "signal"],
    description: "Amplifies or attenuates an audio signal.",
    inputDescriptions: [
      { name: "input", description: "Audio signal to amplify", type: "signal" },
      {
        name: "gain",
        description: "Gain amount (0 = silent, 1 = unity, >1 = amplified)",
        type: "signal",
      },
    ],
    outputDescriptions: [
      { name: "output", description: "Amplified audio signal", type: "signal" },
    ],
  },
  {
    title: "clock",
    type: "clock",
    categories: ["timing"],
    description: "Generates timing pulses at a specified tempo.",
    inputDescriptions: [],
    outputDescriptions: [
      {
        name: "pulse",
        description: "Clock pulse messages at specified intervals",
        type: "message-bus",
      },
    ],
  },
  {
    title: "logger",
    type: "logger",
    categories: ["utility"],
    description: "Logs incoming messages to the console for debugging.",
    inputDescriptions: [
      { name: "input", description: "Messages to log", type: "message-bus" },
    ],
    outputDescriptions: [],
  },
  {
    title: "scale",
    type: "scale",
    categories: ["signal-operator", "signal"],
    description: "Maps input signal values from one range to another.",
    inputDescriptions: [
      { name: "input", description: "Input signal to scale", type: "signal" },
    ],
    outputDescriptions: [
      { name: "output", description: "Scaled signal", type: "signal" },
    ],
  },
  {
    title: "msg-to-signal",
    type: "msg-to-signal",
    categories: ["message", "signal"],
    description: "Converts discrete messages into continuous control signals.",
    inputDescriptions: [
      {
        name: "input",
        description: "Messages to convert to signal",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Continuous control signal",
        type: "signal",
      },
    ],
  },
  {
    title: "sequence",
    type: "sequence",
    categories: ["timing", "message-bus"],
    description: "Sequencer for generating timed messages in patterns.",
    inputDescriptions: [],
    outputDescriptions: [
      { name: "output", description: "Sequence messages", type: "message-bus" },
    ],
  },
  {
    title: "ui-slider",
    type: "ui-slider",
    GUIComponent: "SliderModule",
    categories: ["ui-control", "signal"],
    description: "Interactive slider control for continuous signal values.",
    inputDescriptions: [],
    outputDescriptions: [
      { name: "output", description: "Slider value as signal", type: "signal" },
    ],
  },
  {
    title: "ui-knob",
    type: "ui-knob",
    GUIComponent: "RotaryKnobModule",
    categories: ["ui-control", "signal"],
    description: "Rotary knob control for continuous signal values.",
    inputDescriptions: [],
    outputDescriptions: [
      { name: "output", description: "Knob value as signal", type: "signal" },
    ],
  },
  {
    title: "ui-slider-msg",
    type: "ui-slider-msg",
    GUIComponent: "SliderModule",
    categories: ["ui-control", "message-bus"],
    description: "Interactive slider control for message bus values.",
    inputDescriptions: [],
    outputDescriptions: [
      {
        name: "output",
        description: "Slider value as message",
        type: "message-bus",
      },
    ],
  },
  {
    title: "msg-display",
    type: "msg-display",
    GUIComponent: "DisplayMessageModule",
    categories: ["message", "message-bus"],
    description: "Displays incoming messages visually.",
    inputDescriptions: [
      {
        name: "input",
        description: "Messages to display",
        type: "message-bus",
      },
    ],
    outputDescriptions: [],
  },
  {
    title: "filter",
    type: "filter",
    categories: ["filter", "signal"],
    description: "Filters audio signal by frequency.",
    inputDescriptions: [
      { name: "input", description: "Audio signal to filter", type: "signal" },
      {
        name: "frequency",
        description: "Filter cutoff frequency in Hz",
        type: "signal",
      },
    ],
    outputDescriptions: [
      { name: "output", description: "Filtered signal", type: "signal" },
    ],
  },
  {
    title: "fx-convolution-reverb",
    type: "fx-convolution-reverb",
    categories: ["effect", "signal"],
    description: "Convolution reverb effect using impulse responses.",
    inputDescriptions: [
      { name: "input", description: "Audio signal to process", type: "signal" },
      {
        name: "mix",
        description: "Dry/wet mix (0 = dry, 1 = wet)",
        type: "signal",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Reverb-processed signal",
        type: "signal",
      },
    ],
  },
  {
    title: "fx-delay",
    type: "fx-delay",
    categories: ["effect", "signal"],
    description: "Feedback delay effect with adjustable time and feedback.",
    inputDescriptions: [
      { name: "signal", description: "Audio signal to delay", type: "signal" },
      {
        name: "delayTime",
        description: "Delay time in seconds",
        type: "signal",
      },
      {
        name: "feedback",
        description: "Feedback amount (0-1)",
        type: "signal",
      },
      {
        name: "mix",
        description: "Dry/wet mix (0 = dry, 1 = wet)",
        type: "signal",
      },
    ],
    outputDescriptions: [
      { name: "output", description: "Delayed signal", type: "signal" },
    ],
  },
  {
    title: "fx-delay-analog",
    type: "fx-delay-analog",
    categories: ["effect", "signal"],
    description: "Analog-style delay effect.",
    inputDescriptions: [
      { name: "input", description: "Audio signal to delay", type: "signal" },
    ],
    outputDescriptions: [
      { name: "output", description: "Delayed signal", type: "signal" },
    ],
  },
  {
    title: "ui-switch",
    type: "ui-switch",
    GUIComponent: "UISwitchModule",
    categories: ["ui-control", "signal"],
    description: "Switches between two audio signal inputs.",
    inputDescriptions: [
      {
        name: "channel-1",
        description: "Audio signal input for channel 1",
        type: "signal",
      },
      {
        name: "channel-2",
        description: "Audio signal input for channel 2",
        type: "signal",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Selected channel signal output",
        type: "signal",
      },
    ],
  },
  {
    title: "ui-button",
    type: "ui-button",
    GUIComponent: "ButtonTrigModule",
    categories: ["ui-control", "message-bus"],
    description: "Button that sends a message when clicked.",
    inputDescriptions: [],
    outputDescriptions: [
      {
        name: "output",
        description: "Trigger message on click",
        type: "message-bus",
      },
    ],
  },
  {
    title: "msg-box",
    type: "msg-box",
    GUIComponent: "MessageBoxModule",
    categories: ["message", "message-bus"],
    description: "Stores and outputs a customizable message on trigger.",
    inputDescriptions: [
      {
        name: "trigger",
        description: "Message to trigger output",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      { name: "output", description: "Stored message", type: "message-bus" },
    ],
  },
  {
    title: "noise",
    type: "noise",
    categories: ["source", "signal"],
    description: "Generates noise signal (white, pink, brown).",
    inputDescriptions: [],
    outputDescriptions: [
      { name: "output", description: "Noise signal", type: "signal" },
    ],
  },
  {
    title: "env-adsr",
    type: "env-adsr",
    categories: ["envelope", "signal"],
    description:
      "ADSR (Attack, Decay, Sustain, Release) envelope for shaping signals.",
    inputDescriptions: [
      {
        name: "trigger",
        description: "Trigger message to start envelope",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      { name: "output", description: "Envelope signal", type: "signal" },
    ],
  },
  {
    title: "midi-input",
    type: "midi-input",
    GUIComponent: "MidiInputModule",
    categories: ["midi", "message-bus"],
    description: "Receives MIDI messages from connected devices.",
    inputDescriptions: [],
    outputDescriptions: [
      { name: "output", description: "MIDI messages", type: "message-bus" },
    ],
  },
  {
    title: "midi-cc",
    type: "midi-cc",
    GUIComponent: "MidiCCModule",
    categories: ["midi", "signal"],
    description: "Extracts and outputs MIDI CC values as control signals.",
    inputDescriptions: [
      { name: "input", description: "MIDI messages", type: "message-bus" },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "CC value as signal (0-1)",
        type: "signal",
      },
    ],
  },
  {
    title: "patch-notes",
    type: "patch-notes",
    GUIComponent: "PatchNotesModule",
    categories: ["utility"],
    description: "Displays documentation and notes for the patch.",
    inputDescriptions: [],
    outputDescriptions: [],
  },
  {
    title: "midi-note-message",
    type: "midi-note-message",
    GUIComponent: "MidiNoteMessageModule",
    categories: ["midi", "message-bus"],
    description: "Extracts and outputs MIDI note messages.",
    inputDescriptions: [
      { name: "input", description: "MIDI messages", type: "message-bus" },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Note number as message",
        type: "message-bus",
      },
    ],
  },
  {
    title: "midi-num-to-hz",
    type: "midi-num-to-hz",
    categories: ["midi", "signal"],
    description: "Converts MIDI note numbers to frequencies in Hz.",
    inputDescriptions: [
      { name: "input", description: "MIDI note number", type: "message-bus" },
    ],
    outputDescriptions: [
      { name: "output", description: "Frequency in Hz", type: "signal" },
    ],
  },
  {
    title: "env-amp",
    type: "env-amp",
    categories: ["envelope", "signal"],
    description:
      "Amplitude envelope for controlling volume dynamics over time.",
    inputDescriptions: [
      {
        name: "trigger",
        description: "Trigger message to start envelope",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      { name: "output", description: "Envelope signal (0-1)", type: "signal" },
    ],
  },
  {
    title: "split",
    type: "split",
    categories: ["utility", "message-bus"],
    description: "Splits incoming messages into separate output routes.",
    inputDescriptions: [
      { name: "input", description: "Message to split", type: "message-bus" },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Split message parts",
        type: "message-bus",
      },
    ],
  },
  {
    title: "player",
    type: "player",
    GUIComponent: "PlayerModule",
    categories: ["source", "signal"],
    description:
      "Plays an audio file with some basic parameters like seek, loop, etc. For a more complete sampler instrument see: sampler",
    inputDescriptions: [
      {
        name: "trigger",
        description: "Trigger playback of sample",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Sample playback audio signal",
        type: "signal",
      },
    ],
  },
  {
    title: "grain-player",
    type: "grain-player",
    GUIComponent: "GrainPlayerModule",
    categories: ["source", "signal"],
    description:
      "Player device designed for granular synthesis and other advanced audio manipulation",
    inputDescriptions: [
      {
        name: "trigger",
        description: "Trigger playback of sample",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Sample playback audio signal",
        type: "signal",
      },
    ],
  },
  {
    title: "sampler",
    type: "sampler",
    GUIComponent: "SamplerModule",
    categories: ["instrument", "signal"],
    description:
      "A basic sampler instrument that supports triggering and re-pitching batches of samples. Good for drum kits and other one-shots.",
    inputDescriptions: [
      {
        name: "trigger",
        description: "Trigger playback of sample",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Sample playback audio signal",
        type: "signal",
      },
    ],
  },
  // {
  //   title: "sampler-plus",
  //   type: "sampler-plus",
  //   GUIComponent: "SamplerPlusModule",
  //   categories: ["source", "signal"],
  //   description:
  //     "A more advanced sampler instrument that operates on one file at a time, but includes features like time-stretching, slicing, and detailed playback controls for granular synthesis.",
  //   inputDescriptions: [
  //     {
  //       name: "trigger",
  //       description: "Trigger playback of sample",
  //       type: "message-bus",
  //     },
  //   ],
  //   outputDescriptions: [
  //     {
  //       name: "output",
  //       description: "Sample playback audio signal",
  //       type: "signal",
  //     },
  //   ],
  // },
  {
    title: "msg-counter",
    type: "msg-counter",
    categories: ["message"],
    description: "Counts messages and outputs the current count.",
    inputDescriptions: [
      {
        name: "increment",
        description: "Input message to increment the counter",
        type: "message-bus",
      },
      {
        name: "set",
        description: "Input message to set the counter to a specific value",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "counter-output",
        description: "Output message with the current counter value",
        type: "message-bus",
      },
    ],
  },
  {
    title: "msg-mod",
    type: "msg-mod",
    categories: ["message"],
    description: "Performs modulo operation on message values.",
    inputDescriptions: [
      {
        name: "input",
        description: "Input message value",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Output message with modulo result",
        type: "message-bus",
      },
    ],
  },
  {
    title: "msg-regex",
    type: "msg-regex",
    categories: ["message", "message-bus"],
    description: "Filters messages using regular expression pattern matching.",
    inputDescriptions: [
      { name: "input", description: "Messages to filter", type: "message-bus" },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Messages matching the regex pattern",
        type: "message-bus",
      },
    ],
  },
  {
    title: "msg-sample",
    type: "msg-sample",
    categories: ["message", "message-bus"],
    description:
      "Samples incoming signal value on message trigger and outputs as discrete message.",
    inputDescriptions: [
      { name: "signal", description: "Signal to sample", type: "signal" },
      {
        name: "trigger",
        description: "Trigger to capture sample",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Sampled signal value as message",
        type: "message-bus",
      },
    ],
  },
  {
    title: "sample-and-hold",
    type: "sample-and-hold",
    categories: ["signal-operator", "signal"],
    description:
      "Captures and holds a signal value, updating when triggered by a message.",
    inputDescriptions: [
      { name: "signal", description: "Signal to capture", type: "signal" },
      {
        name: "trigger",
        description: "Trigger to update held value",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      { name: "output", description: "Held signal value", type: "signal" },
    ],
  },
  {
    title: "delay",
    type: "delay",
    categories: ["signal-operator", "signal"],
    description: "Delays an audio signal by a specified amount of time.",
    inputDescriptions: [
      { name: "input", description: "Signal to delay", type: "signal" },
      {
        name: "delayTime",
        description: "Delay duration in seconds",
        type: "signal",
      },
    ],
    outputDescriptions: [
      { name: "output", description: "Delayed signal", type: "signal" },
    ],
  },
];
