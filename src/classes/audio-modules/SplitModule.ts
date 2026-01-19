import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import * as Tone from "tone";

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
  private _numOutputs: number = 2;
  private _messageOutputNodes: MessageOutputNode[] = [];

  constructor(id: string, options?: SplitModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._delimiter = this._options.delimiter;
    this._numOutputs = this._options.numOutputs;
    this._messageInputNode = new MessageInputNode(
      this._messageInputCallback.bind(this),
    );
    this._messageOutputNodes = Array.from(
      { length: this._numOutputs },
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

  private _messageInputCallback(time: number, message: any) {
    if (Array.isArray(message)) {
      console.log("SplitModule received array message:", message);
      for (let i = 0; i < this._numOutputs; i++) {
        if (i < message.length) {
          this._messageOutputNodes[i]!.scheduleMessage(time, message[i]);
        }
      }
    } else if (typeof message === "string") {
      const parts = message.split(this._delimiter);
      for (let i = 0; i < this._numOutputs; i++) {
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
      this._numOutputs = options.numOutputs;

      // todo: should we nuke all old outputs?
      // or only add/remove the difference in number of outputs?
      this._messageOutputNodes = Array.from(
        { length: this._numOutputs },
        () => new MessageOutputNode(),
      );
      this._outputs = this._messageOutputNodes.map(
        (node, index) => new ModuleOutput(`message-output-${index + 1}`, node),
      );
    }
  }

  dispose(): void {}
}
