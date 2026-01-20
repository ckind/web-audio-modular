import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import * as Tone from "tone";


type MessageTrigModuleOptions = {
  trigMessage: any;
};

const getDefaultOptions = (): MessageTrigModuleOptions => ({
  trigMessage: "",
});

export default class MessageTrigModule extends AudioModule<MessageTrigModuleOptions> {
  private _messageOutputNode: MessageOutputNode;
  private _trigInputNode: MessageInputNode;

  constructor(id: string, options?: MessageTrigModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageOutputNode = new MessageOutputNode();
    this._trigInputNode = new MessageInputNode(this._trigMessageCallack.bind(this));

    this._inputs = [new ModuleInput("trig-input", this._trigInputNode)];
    this._outputs = [new ModuleOutput("message-output", this._messageOutputNode)];
  }

  get type(): AudioModuleType {
    return "msg-box";
  }

  private _trigMessageCallack() {
    this._messageOutputNode.scheduleMessage(
      Tone.now(),
      this._options.trigMessage,
    );
  }

  updateOptions(options: Partial<MessageTrigModuleOptions>): void {
    if (options.trigMessage !== undefined) {
      this._options.trigMessage = options.trigMessage;
    }
  }

  dispose(): void {}
}
