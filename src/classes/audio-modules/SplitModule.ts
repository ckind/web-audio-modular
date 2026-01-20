import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import type { MessageBusDataType } from "@/types/connectionTypes";

type SplitModuleOptions = {
  numOutputs: number;
  delimiter: string;
};

const getDefaultOptions = (): SplitModuleOptions => ({
  numOutputs: 2,
  delimiter: ",",
});

export default class SplitModule extends AudioModule<SplitModuleOptions> {
  private _delimiter: string;
  private _messageInputNode: MessageInputNode;
  private _messageOutputNodes: MessageOutputNode[] = [];

  constructor(id: string, options?: SplitModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._delimiter = this._options.delimiter;
    this._messageInputNode = new MessageInputNode(
      this._messageInputCallback.bind(this),
    );
    this._messageOutputNodes = Array.from(
      { length: this._options.numOutputs },
      () => new MessageOutputNode(),
    );

    this._inputs = [new ModuleInput("message-input", this._messageInputNode)];
    this._outputs = this._messageOutputNodes.map(
      (node, index) => new ModuleOutput(`message-output-${index + 1}`, node),
    );
  }

  get type(): AudioModuleType {
    return "split";
  }

  private _messageInputCallback(time: number, data?: MessageBusDataType): void {
    if (Array.isArray(data)) {
      for (let i = 0; i < this._options.numOutputs; i++) {
        if (i < data.length) {
          this._messageOutputNodes[i]!.scheduleMessage(time, data[i]);
        }
      }
    } else if (typeof data === "string") {
      const parts = data.split(this._delimiter);
      for (let i = 0; i < this._options.numOutputs; i++) {
        if (i < parts.length) {
          this._messageOutputNodes[i]!.scheduleMessage(time, parts[i]!.trim());
        }
      }
    }
  }

  updateOptions(options: Partial<SplitModuleOptions>): void {
    if (options.delimiter !== undefined) {
      this._options.delimiter = options.delimiter;
      this._delimiter = options.delimiter;
    }
    if (options.numOutputs !== undefined) {
      this._options.numOutputs = options.numOutputs;

      // todo: should we nuke all old outputs?
      // or only add/remove the difference in number of outputs?
      this._messageOutputNodes = Array.from(
        { length: options.numOutputs },
        () => new MessageOutputNode(),
      );
      this._outputs = this._messageOutputNodes.map(
        (node, index) => new ModuleOutput(`message-output-${index + 1}`, node),
      );

      if (this.updateUIInstanceOutputs) {
        const outputs = this._outputs.map((o) => {
          return { name: o.name, type: o.type };
        });
        this.updateUIInstanceOutputs(outputs);
      }
    }
  }

  dispose(): void {}
}
