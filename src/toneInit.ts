import * as Tone from "tone";
import { onMounted } from "vue";
import { createAudioContext } from "./composables/useAudioGlobalContext";

function setupAutoResume() {
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

async function registerAudioWorklets(
  ctx: AudioContext,
  workletPaths: string[],
) {
  const promises = new Array(workletPaths.length);

  for (let i = 0; i < workletPaths.length; i++) {
    const path = workletPaths[i]!;
    const workletUrl = new URL(path, import.meta.url);
    promises[i] = ctx.audioWorklet.addModule(workletUrl.href);
  }

  await Promise.all(promises);
}

export function init(callback?: () => void) {
  onMounted(async () => {
    const ctx = await createAudioContext();
    await registerAudioWorklets(ctx, [
      "./classes/audio-worklets/ScaleWorkletProcessor.js",
      "./classes/audio-worklets/SamplerPlusWorkletProcessor.js",
    ]);

    Tone.setContext(ctx);

    setupAutoResume();

    if (callback) {
      callback();
    }
  });

  return {};
}
