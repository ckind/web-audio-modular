import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import * as Tone from "tone";
import ModuleOutput from "@/classes/ModuleOutput";
import type { MessageBusDataType } from "@/types/connectionTypes";

type UIButtonModuleOptions = {
  trigMessage: MessageBusDataType;
};

const getDefaultOptions = (): UIButtonModuleOptions => ({
  trigMessage: "",
});

export default class UIButtonModule extends AudioModule<UIButtonModuleOptions> {
  private _messageOutput: MessageOutputNode;

  constructor(id: string, options?: UIButtonModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageOutput = new MessageOutputNode();
    this._outputs = [new ModuleOutput("trig-output", this._messageOutput)];
  }

  get type(): AudioModuleType {
    return "ui-button";
  }

  updateOptions(options: Partial<UIButtonModuleOptions>): void {
    if (options.trigMessage !== undefined) {
      this._options.trigMessage = options.trigMessage;
      this._messageOutput.scheduleMessage(
        Tone.immediate(),
        this._options.trigMessage,
      );
    }
  }

  dispose(): void {}
}
