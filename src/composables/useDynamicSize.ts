import { ref } from "vue";
import useResizeObserver from "@/composables/useResizeObserver";

export default function useDynamicSize(refName: string) {
  const width = ref(0);
  const height = ref(0);

  useResizeObserver(refName, (entries) => {
    for (let entry of entries) {
      width.value = entry.contentRect.width;
      height.value = entry.contentRect.height;
    }
  });

  return { width, height };
}