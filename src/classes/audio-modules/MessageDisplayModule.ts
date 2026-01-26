import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes//ModuleInput.ts";
import type { AudioModuleType } from "@/classes/audio-modules/AudioModule.ts";
import MessageInputNode from "@/classes/MessageInputNode";
import type { MessageBusDataType } from "@/types/connectionTypes";

type MessageDisplayModuleOptions = {
  message: MessageBusDataType;
};

const getDefaultOptions = (): MessageDisplayModuleOptions => ({
  message: "",
});

export default class MessageDisplayModule extends AudioModule<MessageDisplayModuleOptions> {
  constructor(id: string, options?: MessageDisplayModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._inputs = [
      new ModuleInput(
        "message-input",
        new MessageInputNode(this.messageCallback.bind(this)),
      ),
    ];
  }

  get type(): AudioModuleType {
    return "msg-display";
  }

  messageCallback(time: number, data?: MessageBusDataType): void {
    if (this.updateUIState) {
      this.updateUIState({ message: data });
    }
  }

  updateOptions(options: Partial<MessageDisplayModuleOptions>): void {
    // No options to update for display message
  }

  dispose(): void {
    // No resources to clean up for display message
  }
}
