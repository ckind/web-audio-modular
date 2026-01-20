import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import * as Tone from "tone";
import ModuleOutput from "@/classes/ModuleOutput";
import type { MessageBusDataType } from "@/types/connectionTypes";

type ButtonTrigModuleOptions = {
  trigMessage: MessageBusDataType;
};

const getDefaultOptions = (): ButtonTrigModuleOptions => ({
  trigMessage: "",
});

export default class ButtonTrigModule extends AudioModule<ButtonTrigModuleOptions> {
  private _messageOutput: MessageOutputNode;

  constructor(id: string, options?: ButtonTrigModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageOutput = new MessageOutputNode();
    this._outputs = [new ModuleOutput("trig-output", this._messageOutput)];
  }

  get type(): AudioModuleType {
    return "ui-button";
  }

  updateOptions(options: Partial<ButtonTrigModuleOptions>): void {
    if (options.trigMessage !== undefined) {
      this._options.trigMessage = options.trigMessage;
      this._messageOutput.scheduleMessage(
        Tone.now(),
        this._options.trigMessage,
      );
    }
  }

  dispose(): void {}
}
