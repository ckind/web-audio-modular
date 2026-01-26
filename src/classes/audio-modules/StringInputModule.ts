import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import * as Tone from "tone";
import type { MessageBusDataType, MessageBusString } from "@/types/connectionTypes";

export type StringInputModuleOptions = {
  message?: MessageBusString;
};

const getDefaultOptions = (): StringInputModuleOptions => ({
  message: "",
});

export default class StringInputModule extends AudioModule<StringInputModuleOptions> {
  private _messageOutputNode: MessageOutputNode;
  private _setInputNode: MessageInputNode;
  private _trigInputNode: MessageInputNode;

  constructor(id: string, options?: StringInputModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageOutputNode = new MessageOutputNode();
    this._setInputNode = new MessageInputNode(
      this._setMessageCallack.bind(this),
    );
    this._trigInputNode = new MessageInputNode(
      this._trigMessageCallack.bind(this),
    );

    this._inputs = [
      new ModuleInput("set", this._setInputNode),
      new ModuleInput("trig", this._trigInputNode),
    ];
    this._outputs = [new ModuleOutput("output", this._messageOutputNode)];
  }

  get type(): AudioModuleType {
    return "str-input";
  }

  private _setMessageCallack(time: number, data?: MessageBusDataType) {
    Tone.getTransport().schedule(() => {
      this._options.message = data?.toString();
      if (this.updateUIState) {
        this.updateUIState(this._options);
      }
    }, time);
  }

  private _trigMessageCallack(time: number, data?: MessageBusDataType) {
    this._messageOutputNode.scheduleMessage(time, this._options.message);
  }

  updateOptions(options: Partial<StringInputModuleOptions>): void {
    if (options.message !== undefined) {
      this._options.message = options.message;
    }
  }

  dispose(): void {}
}
