import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

type MessageRegexModuleOptions = {
  regex: string;
};

const getDefaultOptions = (): MessageRegexModuleOptions => ({
  regex: ".*",
});

export default class MessageRegexModule extends AudioModule<MessageRegexModuleOptions> {
  private _messageOutputNode: MessageOutputNode;
  private _messageInputNode: MessageInputNode;
  private _regex: RegExp;

  constructor(id: string, options?: MessageRegexModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._regex = new RegExp(this._options.regex);

    this._messageInputNode = new MessageInputNode(
      this._messageInputCallback.bind(this),
    );
    this._messageOutputNode = new MessageOutputNode();

    this._inputs = [new ModuleInput("message-input", this._messageInputNode)];
    this._outputs = [
      new ModuleOutput("message-output", this._messageOutputNode),
    ];
  }

  get type(): AudioModuleType {
    return "msg-regex";
  }

  private _messageInputCallback(time: number, data?: MessageBusDataType): void {
    if (
      data !== undefined &&
      typeof data === "string" &&
      !this._regex.test(data)
    ) {
      return;
    }

    this._messageOutputNode.scheduleMessage(time, data);
  }

  updateOptions(options: Partial<MessageRegexModuleOptions>): void {
    if (options.regex !== undefined) {
      this._options.regex = options.regex;
      this._regex = new RegExp(this._options.regex);
    }
  }

  dispose(): void {}
}
