import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageOutputNode from "@/classes/MessageOutputNode";
import MessageInputNode from "@/classes/MessageInputNode";
import ScaleWorkletNode from "@/classes/audio-nodes/ScaleWorkletNode";
import * as Tone from "tone";
import type { MessageBusDataType } from "@/types/connectionTypes";

type ScaleModuleOptions = {
  inputMin: number;
  inputMax: number;
  outputMin: number;
  outputMax: number;
  curve: number;
};

const getDefaultOptions = (): ScaleModuleOptions => ({
  inputMin: -1,
  inputMax: 1,
  outputMin: 0,
  outputMax: 1,
  curve: 1
});

function scaleValue(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
): number {
  const scaled =
    ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) +
    outputMin;
  return scaled;
}

export default class ScaleModule extends AudioModule<ScaleModuleOptions> {
  private _scaleNode: ScaleWorkletNode;
  private _messageInputNode: MessageInputNode;
  private _messageOutputNode: MessageOutputNode;

  constructor(id: string, options?: ScaleModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._scaleNode = new ScaleWorkletNode({
      inputMin: this._options.inputMin,
      inputMax: this._options.inputMax,
      outputMin: this._options.outputMin,
      outputMax: this._options.outputMax,
      curveAmount: this._options.curve,
    });

    this._messageInputNode = new MessageInputNode(
      this.messageInputCallback.bind(this),
    );
    this._messageOutputNode = new MessageOutputNode();

    this._inputs = [
      new ModuleInput("signal-input", this._scaleNode),
      new ModuleInput("message-input", this._messageInputNode),
    ];
    this._outputs = [
      new ModuleOutput("signal-output", this._scaleNode),
      new ModuleOutput("message-output", this._messageOutputNode),
    ];
  }

  get type(): AudioModuleType {
    return "scale";
  }

  updateOptions(options: Partial<ScaleModuleOptions>): void {
    if (options.inputMin !== undefined) {
      this._scaleNode.inputMin.value = options.inputMin;
      this._options.inputMin = options.inputMin;
    }
    if (options.inputMax !== undefined) {
      this._scaleNode.inputMax.value = options.inputMax;
      this._options.inputMax = options.inputMax;
    }
    if (options.outputMin !== undefined) {
      this._scaleNode.outputMin.value = options.outputMin;
      this._options.outputMin = options.outputMin;
    }
    if (options.outputMax !== undefined) {
      this._scaleNode.outputMax.value = options.outputMax;
      this._options.outputMax = options.outputMax;
    }
    if (options.curve !== undefined) {
      // todo: user feedback for validation?
      const validCurve = options.curve <= 0 ? 1 : options.curve;
      this._scaleNode.curve.value = validCurve;
      this._options.curve = validCurve;
    }
  }

  messageInputCallback(time: number, data?: MessageBusDataType): void {
    const num = new Number(data);
    if (!isNaN(num.valueOf())) {
      const scaledValue = scaleValue(
        num.valueOf(),
        this._options.inputMin,
        this._options.inputMax,
        this._options.outputMin,
        this._options.outputMax,
      );
      this._messageOutputNode.scheduleMessage(time, scaledValue);
    }
  }

  dispose(): void {
    this._scaleNode.dispose();
  }
}
