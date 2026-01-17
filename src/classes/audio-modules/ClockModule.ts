import AudioModule from "@/classes/audio-modules/AudioModule";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule";
import ModuleInput from "@/classes/ModuleInput";
import ModuleOutput from "@/classes/ModuleOutput";
import MessageOutputNode from "@/classes/MessageOutputNode";

type ClockModuleOptions = {
  bpm: number;
};

const getDefaultOptions = (): ClockModuleOptions => ({
  bpm: 120,
});

export default class ClockModule extends AudioModule<ClockModuleOptions> {
  private _intervalSeconds: number;
  private _outputNode: MessageOutputNode;
  private _running: boolean = false;

  constructor(id: string, ctx: AudioContext, options?: ClockModuleOptions) {
    super(id, ctx, options ?? getDefaultOptions());

    this._intervalSeconds = 60 / this._options.bpm;
    this._outputNode = new MessageOutputNode(ctx);

    this._outputs = [new ModuleOutput("clock-tick-output", this._outputNode)];

    // todo: need to implement the actual ticking logic
    // just schedule 100 message events for now
    for (let i = 0; i < 100; i++) {
      this._outputNode.scheduleMessage(
        ctx.currentTime + i * this._intervalSeconds,
        i + 1,
      );
    }
  }

  get type(): AudioModuleType {
    return "clock";
  }

  updateOptions(options: Partial<ClockModuleOptions>): void {
    if (options.bpm !== undefined) {
      this._options.bpm = options.bpm;
      this._intervalSeconds = 60 / this._options.bpm;
    }
  }

  start(time: number) {
    this._running = true;
  }

  stop(time: number) {
    this._running = false;
  }

  scheduleTick(time: number, data: any) {
    if (!this._running) return;

    this._outputNode.scheduleMessage(time, data);
  }

  dispose(): void {
    this.stop(this._ctx.currentTime);
    this._outputNode.disconnect();
  }
}
