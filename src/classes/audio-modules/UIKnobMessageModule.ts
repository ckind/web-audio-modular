import AudioModule, {
  type AudioModuleType,
} from "@/classes/audio-modules/AudioModule";
import * as Tone from "tone";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageOutputNode from "@/classes/MessageOutputNode";

type UIKnobMessageModuleOptions = {
  min: number;
  max: number;
  value: number;
};

const getDefaultOptions = (): UIKnobMessageModuleOptions => ({
  min: 0,
  max: 1,
  value: 0,
});

export default class UIKnobMessageModule extends AudioModule<UIKnobMessageModuleOptions> {
  private _messageOutputNode: MessageOutputNode;

  constructor(id: string, options?: UIKnobMessageModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageOutputNode = new MessageOutputNode();

    this._outputs = [new ModuleOutput("message-output", this._messageOutputNode)];
  }

  get type(): AudioModuleType {
    return "ui-knob-msg";
  }

  updateOptions(options: Partial<UIKnobMessageModuleOptions>): void {
    if (options.min !== undefined) {
      this._options.min = options.min;
    }
    if (options.max !== undefined) {
      this._options.max = options.max;
    }
    if (options.value !== undefined) {
      this._options.value = options.value;
      this._messageOutputNode.scheduleMessage(Tone.immediate(), options.value);
    }
  }

  dispose(): void {}
}
