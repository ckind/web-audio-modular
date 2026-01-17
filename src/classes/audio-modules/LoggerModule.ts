import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes//ModuleInput.ts";
import { type AudioModuleType } from "@/classes/audio-modules/AudioModule.ts";
import { MessageInputNode } from "../MessageInputNode";

type LoggerModuleOptions = {};

const getDefaultOptions = (): LoggerModuleOptions => ({});

const logMessage = (message: any) => {
  console.log("LoggerModule received message:", message);
};

export default class LoggerModule extends AudioModule<LoggerModuleOptions> {
  constructor(id: string, ctx: AudioContext, options?: LoggerModuleOptions) {
    super(id, ctx, options ?? getDefaultOptions());

    this._inputs = [
      new ModuleInput("message-input", new MessageInputNode(ctx, logMessage)),
    ];
  }

  get type(): AudioModuleType {
    return "logger";
  }

  updateOptions(options: Partial<LoggerModuleOptions>): void {
    // No options to update for logger
  }

  dispose(): void {
    // No resources to clean up for logger
  }
}
