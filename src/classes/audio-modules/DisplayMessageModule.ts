import AudioModule from "@/classes/audio-modules/AudioModule.ts";
import ModuleInput from "@/classes//ModuleInput.ts";
import type {
  AudioModuleType,
  UpdateUIStateCallback,
} from "@/classes/audio-modules/AudioModule.ts";
import MessageInputNode from "@/classes/MessageInputNode";

type DisplayMessageModuleOptions = {
  message: "";
};

const getDefaultOptions = (): DisplayMessageModuleOptions => ({
  message: "",
});

export default class DisplayMessageModule extends AudioModule<DisplayMessageModuleOptions> {
  constructor(id: string, options?: DisplayMessageModuleOptions) {
    super(id, options ?? getDefaultOptions());

    this._inputs = [
      new ModuleInput(
        "message-input",
        new MessageInputNode(this.messageCallback.bind(this)),
      ),
    ];
  }

  get type(): AudioModuleType {
    return "display-message";
  }

  messageCallback(time: number, message: any) {
    if (this.updateUIInstanceOptions) {
      this.updateUIInstanceOptions({ message });
    }
  }

  updateOptions(options: Partial<DisplayMessageModuleOptions>): void {
    // No options to update for display message
  }

  dispose(): void {
    // No resources to clean up for display message
  }
}
