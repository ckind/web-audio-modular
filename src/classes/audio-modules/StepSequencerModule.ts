import MessageOutputNode from "@/classes/MessageOutputNode";
import AudioModule, {
  type AudioModuleType,
} from "@/classes/audio-modules/AudioModule";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import MessageInputNode from "../MessageInputNode";
import type {
  MessageBusDataType,
  MessageBusList,
} from "@/types/connectionTypes";

export type StepSequencerMode = "4x16" | "2x32" | "1x64";

export type StepSequencerModuleOptions = {
  sequence: number[];
  mode: StepSequencerMode;
  currentIndex: number;
};

const getDefaultOptions = (): StepSequencerModuleOptions => ({
  sequence: new Array(64).fill(0),
  mode: "4x16",
  currentIndex: 0,
});

export default class StepSequencerModule extends AudioModule<StepSequencerModuleOptions> {
  private _messageOutput: MessageOutputNode;

  constructor(id: string, options?: StepSequencerModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._messageOutput = new MessageOutputNode();

    this._inputs = [
      new ModuleInput(
        "trigger-input",
        new MessageInputNode((time: number) => {
          this.trigger(time);
        }),
      ),
    ];
    this._outputs = [new ModuleOutput("sequence-output", this._messageOutput)];
  }

  get type(): AudioModuleType {
    return "sequence";
  }

  updateOptions(options: Partial<StepSequencerModuleOptions>): void {
    if (options.sequence !== undefined) {
      for (let i = 0; i < options.sequence.length; i++) {
        this._options.sequence[i]! = options.sequence[i]!;
      }
    }
  }

  trigger(time: number, data?: MessageBusDataType): void {
    switch (this._options.mode) {
      case "4x16":
        this._messageOutput.scheduleMessage(time, [
          this._options.sequence[this._options.currentIndex],
          this._options.sequence[this._options.currentIndex + 16],
          this._options.sequence[this._options.currentIndex + 32],
          this._options.sequence[this._options.currentIndex + 48],
        ] as MessageBusList);
        this._options.currentIndex = (this._options.currentIndex + 1) % 16;
        break;
      case "2x32":
        this._messageOutput.scheduleMessage(time, [
          this._options.sequence[this._options.currentIndex],
          this._options.sequence[this._options.currentIndex + 32],
        ] as MessageBusList);
        this._options.currentIndex = (this._options.currentIndex + 1) % 32;
        break;
      case "1x64":
        this._messageOutput.scheduleMessage(time, [
          this._options.sequence[this._options.currentIndex],
        ] as MessageBusList);
        this._options.currentIndex = (this._options.currentIndex + 1) % 64;
        break;
    }

    if (this.updateUIState) {
      this.updateUIState({ currentIndex: this._options.currentIndex });
    }
  }

  dispose(): void {
    // no resources to clean up
  }
}
