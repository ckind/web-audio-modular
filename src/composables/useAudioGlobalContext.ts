import { onMounted, ref } from "vue";

let globalAudioContext: AudioContext | undefined;

export async function addAudioWorkletModules(
  ctx: AudioContext,
  customWorkletUrls: string[]
) {
  const promises = customWorkletUrls.map((url) =>
    ctx.audioWorklet.addModule(url)
  );

  await Promise.all(promises);
}

export function setupAutoResume(
  ctx: AudioContext,
  resumedCallback?: (ctx: AudioContext) => void
) {
  document.addEventListener("mousedown", () => {
    if (ctx.state != "running") {
      console.log("audio context resumed");
      ctx.resume();

      if (resumedCallback) {
        resumedCallback(ctx);
      }
    }
  });
}

export async function createAudioContext(
  resumedCallback?: (ctx: AudioContext) => void
): Promise<AudioContext> {
  const ctx = new window.AudioContext();

  await addAudioWorkletModules(ctx, []);

  setupAutoResume(ctx, resumedCallback);

  return ctx;
}

export async function requestGlobalAudioContext(
  resumedCallback?: (ctx: AudioContext) => void
): Promise<AudioContext> {
  await navigator.locks.request("globalAudioContext", async (lock) => {
    if (globalAudioContext === undefined) {
      globalAudioContext = await createAudioContext(resumedCallback);
      console.log("initialized global audio context", globalAudioContext);
    }
  });

  return globalAudioContext!;
}

export default function useGlobalAudioContext(
  callback: (ctx: AudioContext) => void
) {
  const ctx = ref<AudioContext | null>(null);

  onMounted(async () => {
    ctx.value = await requestGlobalAudioContext();
    callback(ctx.value);
  });

  return {
    ctx,
  };
}
