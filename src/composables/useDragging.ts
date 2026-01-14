import { ref } from "vue";

export default function useDragging(
  dragCallback: (deltaX: number, deltaY: number, data?: any) => any,
  dragEndCallback?: (data?: any) => any,
  dragStartCallback?: (data?: any) => any
) {
  const prevY = ref(-1);
  const prevX = ref(-1);
  const dragging = ref(false);

  let controller: AbortController;
  let signal: AbortSignal;

  function onDragElementStart(e: MouseEvent | TouchEvent, data?: any) {
    e.preventDefault();

    controller = new AbortController();
    signal = controller.signal;

    if (dragStartCallback) {
      dragStartCallback(data);
    }

    document.addEventListener(
      "mousemove",
      (e: MouseEvent) => onMouseDrag(e, data),
      { signal }
    );
    // todo: how does this work with multiple touches?
    document.addEventListener(
      "touchmove",
      (e: TouchEvent) => onTouchDrag(e, data),
      { signal }
    );
    document.addEventListener(
      "mouseup",
      (e: MouseEvent) => onDocumentUp(e, data),
      { signal }
    );
    document.addEventListener(
      "touchend",
      (e: TouchEvent) => onDocumentUp(e, data),
      { signal }
    );
  }

  function onDocumentUp(e: Event, data?: any) {
    controller.abort();

    prevY.value = -1;
    prevX.value = -1;
    dragging.value = false;

    if (dragEndCallback) {
      dragEndCallback(data);
    }
  }

  function onMouseDrag(e: MouseEvent, data?: any) {
    onDrag(e.pageX, e.pageY, data);
    prevY.value = e.pageY;
    prevX.value = e.pageX;
  }

  function onTouchDrag(e: TouchEvent, data?: any) {
    if (e.touches[0]) {
      onDrag(e.touches[0].pageX, e.touches[0].pageY, data);
      prevY.value = e.touches[0].pageY;
      prevX.value = e.touches[0].pageX;
    }
  }

  function onDrag(currX: number, currY: number, data?: any) {
    dragging.value = true;
    if (prevY.value > -1) {
      const deltaX = currX - prevX.value;
      const deltaY = currY - prevY.value;
      dragCallback(deltaX, deltaY, data);
    }
  }

  return {
    onDragElementStart,
    dragging,
  };
}
