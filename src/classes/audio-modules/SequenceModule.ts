import MessageOutputNode from "@/classes/MessageOutputNode";
import AudioModule, {
  type AudioModuleType,
} from "@/classes/audio-modules/AudioModule";
import ModuleOutput from "@/classes/ModuleOutput";
import ModuleInput from "../ModuleInput";
import MessageInputNode from "../MessageInputNode";

type SequenceModuleOptions = {
  values: string;
};

const getDefaultOptions = (): SequenceModuleOptions => ({
  values: "0 | 0",
});

export default class SequenceModule extends AudioModule<SequenceModuleOptions> {
  private _currentIndex: number = 0;
  private _messageOutput: MessageOutputNode;
  private _valuesArray: string[] = [];

  constructor(id: string, options?: SequenceModuleOptions) {
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

  updateOptions(options: Partial<SequenceModuleOptions>): void {
    if (options.values !== undefined) {
      this._options.values = options.values;
      this._valuesArray = this._options.values.split("|").map((v) => v.trim());
      this._currentIndex = 0; // reset sequence to start when options change
    }
  }

  trigger(time: number) {
    const value = this._valuesArray[this._currentIndex];
    this._messageOutput.scheduleMessage(time, value);
    this._currentIndex = (this._currentIndex + 1) % this._valuesArray.length;
  }

  dispose(): void {
    // no resources to clean up
  }
}
