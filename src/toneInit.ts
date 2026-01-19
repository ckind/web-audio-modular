import * as Tone from "tone";
import { onMounted } from "vue";

export function setupAutoResume() {
  document.addEventListener(
    "mousedown",
    () => {
      console.log("staring Tone.js...");
      Tone.start();
      Tone.getTransport().start();
    },
    { once: true },
  );
}

export function init(callback?: () => void) {
  onMounted(async () => {
    const workletUrl = new URL(
      "./classes/audio-worklets/ScaleWorkletProcessor.js",
      import.meta.url,
    );
    await Tone.getContext().addAudioWorkletModule(workletUrl.href);

    setupAutoResume();

    if (callback) {
      callback();
    }
  });

  return {};
}
