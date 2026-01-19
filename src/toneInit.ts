import * as Tone from "tone";
import { onMounted } from "vue";
import { createAudioContext } from "./composables/useAudioGlobalContext";

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
    const ctx = await createAudioContext();
    const workletUrl = new URL(
      "./classes/audio-worklets/ScaleWorkletProcessor.js",
      import.meta.url,
    );

    await ctx.audioWorklet.addModule(workletUrl.href);
    
    Tone.setContext(ctx);

    setupAutoResume();

    if (callback) {
      callback();
    }
  });

  return {};
}
