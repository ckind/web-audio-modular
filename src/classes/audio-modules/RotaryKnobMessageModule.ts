import AudioModule, {
  type AudioModuleType,
} from "@/classes/audio-modules/AudioModule";
import * as Tone from "tone";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageOutputNode from "@/classes/MessageOutputNode";

type RotaryKnobMessageModuleOptions = {
  min: number;
  max: number;
  value: number;
};

const getDefaultOptions = (): RotaryKnobMessageModuleOptions => ({
  min: 0,
  max: 1,
  value: 0,
});

export default class RotaryKnobMessageModule extends AudioModule<RotaryKnobMessageModuleOptions> {
  private _messageOutputNode: MessageOutputNode;

  constructor(id: string, options?: RotaryKnobMessageModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageOutputNode = new MessageOutputNode();

    this._outputs = [new ModuleOutput("message-output", this._messageOutputNode)];
  }

  get type(): AudioModuleType {
    return "ui-knob-msg";
  }

  updateOptions(options: Partial<RotaryKnobMessageModuleOptions>): void {
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
