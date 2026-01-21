export type ModuleDescriptor = {
  title: string;
  type: string;
  GUIComponent?: string;
  categories: string[];
};

// prettier-ignore
export const availableModules: ModuleDescriptor[] = [
  {
    title: "osc",
    type: "osc",
    categories: ["source", "signal"],
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
    title: "msg-to-signal",
    type: "msg-to-signal",
    categories: ["message", "signal"],
  },
  {
    title: "sequence",
    type: "sequence",
    categories: ["timing", "message-bus"],
  },
  {
    title: "ui-slider",
    type: "ui-slider",
    GUIComponent: "SliderModule",
    categories: ["ui-control", "signal"],
  },
    {
    title: "ui-slider-msg",
    type: "ui-slider-msg",
    GUIComponent: "SliderModule",
    categories: ["ui-control", "message-bus"],
  },
  {
    title: "msg-display",
    type: "msg-display",
    GUIComponent: "DisplayMessageModule",
    categories: ["message", "message-bus"],
  },
  {
    title: "filter",
    type: "filter",
    categories: ["filter", "signal"],
  },
  {
    title: "fx-convolution-reverb",
    type: "fx-convolution-reverb",
    categories: ["effect", "signal"],
  },
  {
    title: "fx-delay",
    type: "fx-delay",
    categories: ["effect", "signal"],
  },
  {
    title: "ui-button",
    type: "ui-button",
    GUIComponent: "ButtonTrigModule",
    categories: ["ui-control", "message-bus"],
  },
  {
    title: "msg-box",
    type: "msg-box",
    GUIComponent: "MessageTrigModule",
    categories: ["message", "message-bus"],
  },
  {
    title: "noise",
    type: "noise",
    categories: ["source", "signal"]
  },
  {
    title: "env-adsr",
    type: "env-adsr",
    categories: ["envelope", "signal"],
  },
  {
    title: "midi-input",
    type: "midi-input",
    GUIComponent: "MidiInputModule",
    categories: ["midi", "message-bus"],
  },
  {
    title: "midi-cc",
    type: "midi-cc",
    GUIComponent: "MidiCCModule",
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
    title: "midi-note-message",
    type: "midi-note-message",
    GUIComponent: "MidiNoteMessageModule",
    categories: ["midi", "message-bus"],
  },
  {
    title: "midi-num-to-hz",
    type: "midi-num-to-hz",
    categories: ["midi", "signal"],
  },
  {
    title: "env-amp",
    type: "env-amp",
    categories: ["envelope", "signal"],
  },
  {
    title: "split",
    type: "split",
    categories: ["utility", "message-bus"],
  },
  {
    title: "sampler-plus",
    type: "sampler-plus",
    GUIComponent: "SamplerPlusModule",
    categories: ["source", "signal"],
  },
  {
    title: "msg-regex",
    type: "msg-regex",
    categories: ["message", "message-bus"],
  },
  {
    title: "msg-sample",
    type: "msg-sample",
    categories: ["message", "message-bus"],
  },
  {
    title: "sample-and-hold",
    type: "sample-and-hold",
    categories: ["signal-operator", "signal"],
  },
];
