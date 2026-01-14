import { onMounted, onUnmounted } from "vue";

type MouseTrackingCallback = (deltaX: number, deltaY: number) => void;

export default function useMouseTracking(callback: MouseTrackingCallback) {
  const updateMousePosition = (event: MouseEvent) => {
    callback(event.movementX, event.movementY);
  };

  onMounted(() => {
    window.addEventListener("mousemove", updateMousePosition);
  });

  onUnmounted(() => {
    window.removeEventListener("mousemove", updateMousePosition);
  });

  const startMouseTracking = () => {
    window.addEventListener("mousemove", updateMousePosition);
  };

  const stopMouseTracking = () => {
    window.removeEventListener("mousemove", updateMousePosition);
  };

  return { startMouseTracking, stopMouseTracking };
}
