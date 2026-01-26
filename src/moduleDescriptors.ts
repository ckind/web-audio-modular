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
    title: "seq-step",
    type: "seq-step",
    GUIComponent: "StepSequencerModule",
    categories: ["sequencer", "message-bus"],
    description:
      "Step sequencer with configurable patterns and output modes (Quad, Duo, Single).",
    inputDescriptions: [
      {
        name: "trigger-input",
        description: "Trigger input to advance the sequencer",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "sequence-output",
        description: "Sequenced message output (Quad, Duo, or Single mode)",
        type: "message-bus",
      },
    ],
  },
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
    title: "num-to-signal",
    type: "num-to-signal",
    categories: ["message", "signal"],
    description:
      "Converts discrete number messages into continuous control signals.",
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
    categories: ["sequencer", "message-bus"],
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
    title: "ui-knob-msg",
    type: "ui-knob-msg",
    GUIComponent: "RotaryKnobModule",
    categories: ["ui-control", "message-bus"],
    description: "Rotary knob control for message bus values.",
    inputDescriptions: [],
    outputDescriptions: [
      {
        name: "output",
        description: "Knob value as message",
        type: "message-bus",
      },
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
    GUIComponent: "MessageDisplayModule",
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
    title: "str-input",
    type: "str-input",
    GUIComponent: "StringInputModule",
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
  {
    title: "synth-mono",
    type: "synth-mono",
    GUIComponent: "MonoSynthModule",
    categories: ["instrument", "signal"],
    description:
      "A simple monophonic synth with two oscillators, noise source, filter and dedicated envelopes for amp and filter.",
    inputDescriptions: [],
    outputDescriptions: [
      {
        name: "output",
        description: "Synth audio output",
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
    title: "num-counter",
    type: "num-counter",
    categories: ["message", "message-bus"],
    description: "Keeps a counter and outputs the current value",
    inputDescriptions: [
      {
        name: "increment",
        description: "Input message (any) to increment the counter",
        type: "message-bus",
      },
      {
        name: "set",
        description:
          "Input message (number) to set the counter to a specific value",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "counter-output",
        description: "Output message (number) with the current counter value",
        type: "message-bus",
      },
    ],
  },
  {
    title: "num-mod",
    type: "num-mod",
    categories: ["message", "message-bus"],
    description: "Performs modulo operation on number message values.",
    inputDescriptions: [
      {
        name: "input",
        description: "Input message (number) value",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Output message (number) with modulo result",
        type: "message-bus",
      },
    ],
  },
  {
    title: "num-add",
    type: "num-add",
    categories: ["message", "message-bus"],
    description: "Performs addition on number messages.",
    inputDescriptions: [
      {
        name: "input",
        description: "Input message (number) value",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Output message (number) with addition result",
        type: "message-bus",
      },
    ],
  },
  {
    title: "num-multiply",
    type: "num-multiply",
    categories: ["message"],
    description: "Performs multiplication on number messages.",
    inputDescriptions: [
      {
        name: "input",
        description: "Input message (number)",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Output message (number) with multiplication result",
        type: "message-bus",
      },
    ],
  },
  {
    title: "list-element",
    type: "list-element",
    categories: ["message", "message-bus"],
    description: "Extracts a specific element from a message list by index.",
    inputDescriptions: [
      {
        name: "input",
        description: "list message to extract from",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Extracted element at specified index",
        type: "message-bus",
      },
    ],
  },
  {
    title: "list-merge",
    type: "list-merge",
    categories: ["message", "message-bus"],
    description:
      "Merge incoming messages into a single list. When the first message arrives on either input 1 or input 2, it is stored. When the next message arrives on the other input, a list containing both messages is send to the output and the store is cleared. List inputs are concatenated together.",
    inputDescriptions: [
      {
        name: "input-1",
        description: "Accepts any message type",
        type: "message-bus",
      },
      {
        name: "input-2",
        description: "Accepts any message type",
        type: "message-bus",
      },
    ],
    outputDescriptions: [
      {
        name: "output",
        description: "Conjoined inputs",
        type: "message-bus",
      },
    ],
  },
  {
    title: "msg-regex",
    type: "msg-regex",
    categories: ["message", "message-bus"],
    description:
      "Filters messages using regular expression pattern matching. The incoming message is converted to a string, checked against the regex, and forwarded as its original data type if there is a match.",
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
