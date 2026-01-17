import * as Tone from "tone";
import { ref, onMounted } from "vue";

export function setupAutoResume() {
  document.addEventListener("mousedown", () => {
    Tone.start();
  }, { once: true });
}

// simple wrapper to setup auto resume for Tone.js on mounted
export default function useToneAutoResume(callback?: () => void) {
  onMounted(async () => {
    setupAutoResume();

    if (callback) {
      callback();
    }
  });

  return {};
}
