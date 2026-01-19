export type ModuleDescriptor = {
  title: string;
  type: string;
  GUIComponent?: string;
  categories: string[];
};

// prettier-ignore
export const availableModules: ModuleDescriptor[] = [
  {
    title: "oscillator",
    type: "oscillator",
    categories: ["sound-source", "signal"],
  },
  {
    title: "speaker-output",
    type: "speaker-output",
    categories: ["output", "signal"],
  },
  {
    title: "gain",
    type: "gain",
    categories: ["signal-operator", "signal"]
  },
  {
    title: "clock",
    type: "clock",
    categories: ["timing"]
  },
  {
    title:"logger",
    type: "logger",
    categories: ["utility"]
  },
  {
    title: "scale",
    type: "scale",
    categories: ["signal-operator", "signal"]
  },
  {
    title: "scale-exp",
    type: "scale-exp",
    categories: ["signal-operator", "signal"],
  },
  {
    title: "message-to-signal",
    type: "message-to-signal",
    categories: ["utility", "signal"],
  },
  {
    title: "sequence",
    type: "sequence",
    categories: ["timing", "message-bus"],
  },
  {
    title: "slider",
    type: "slider",
    GUIComponent: "SliderModule",
    categories: ["ui-control", "signal"],
  },
  {
    title: "display-message",
    type: "display-message",
    GUIComponent: "DisplayMessageModule",
    categories: ["utility", "message-bus"],
  },
  {
    title: "filter",
    type: "filter",
    categories: ["effect", "signal"],
  },
  {
    title: "convolution-reverb",
    type: "convolution-reverb",
    categories: ["effect", "signal"],
  },
  {
    title: "button-trig",
    type: "button-trig",
    GUIComponent: "ButtonTrigModule",
    categories: ["ui-control", "message-bus"],
  },
  {
    title: "message-trig",
    type: "message-trig",
    GUIComponent: "MessageTrigModule",
    categories: ["ui-control", "message-bus"],
  },
  {
    title: "noise",
    type: "noise",
    categories: ["sound-source", "signal"]
  },
  {
    title: "adsr-envelope",
    type: "adsr-envelope",
    categories: ["envelope", "signal"],
  },
  {
    title: "midi-input",
    type: "midi-input",
    GUIComponent: "MidiInputModule",
    categories: ["midi", "message-bus"],
  },
  {
    title: "midi-cc-to-signal",
    type: "midi-cc-to-signal",
    GUIComponent: "MidiCCToSignal",
    categories: ["midi", "signal"],
  },
  {
    title: "pow-curve",
    type: "pow-curve",
    categories: ["signal-operator", "signal"],
  },
  {
    title: "patch-notes",
    type: "patch-notes",
    GUIComponent: "PatchNotesModule",
    categories: ["utility"],
  },
  {
    title: "midi-note-to-trig",
    type: "midi-note-to-trig",
    GUIComponent: "MidiNoteToTrigModule",
    categories: ["midi", "message-bus"],
  },
  {
    title: "adsr-amplitude",
    type: "adsr-amplitude",
    categories: ["envelope", "signal"],
  },
];
