import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "@/classes/ModuleInput";
import type { MessageBusDataType } from "@/types/connectionTypes";

export type NumberModModuleOptions = {
  divisor: number;
};

const getDefaultOptions = (): NumberModModuleOptions => ({
  divisor: 12,
});

export default class NumberModModule extends AudioModule<NumberModModuleOptions> {
  private _messageInputNode: MessageInputNode;
  private _messageOutputNode: MessageOutputNode;

  constructor(id: string, options?: NumberModModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageInputNode = new MessageInputNode(
      this._messageInputCallback.bind(this),
    );
    this._messageOutputNode = new MessageOutputNode();

    this._inputs = [new ModuleInput("input", this._messageInputNode)];
    this._outputs = [new ModuleOutput("output", this._messageOutputNode)];
  }

  get type(): AudioModuleType {
    return "num-mod";
  }

  private _messageInputCallback(time: number, data?: MessageBusDataType): void {
    const num = Number(data);
    if (!isNaN(num)) {
      this._messageOutputNode.scheduleMessage(
        time,
        num % this._options.divisor,
      );
    }
  }

  updateOptions(options: Partial<NumberModModuleOptions>): void {
    if (options.divisor !== undefined) {
      this._options.divisor = options.divisor;
    }
  }

  dispose(): void {}
}
