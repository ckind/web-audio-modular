import {
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  type ComponentPublicInstance,
  type Ref,
  toValue,
} from "vue";

type ResizeCallback = (entries: ResizeObserverEntry[]) => void;

// hack to get the actual element from the template ref
// since it can be a component or an element
const unrefElement = (elRef: Ref<any>) => {
  const plain = toValue(elRef);
  return (plain as ComponentPublicInstance)?.$el ?? plain;
};

export default function useDynamicSize(
  refName: string,
  callback: ResizeCallback
) {
  const elementRef = useTemplateRef<HTMLElement>(refName);
  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    const element = unrefElement(elementRef);
    if (element) {
      resizeObserver = new ResizeObserver((entries) => {
        callback(entries);
      });
      resizeObserver.observe(element);
    }
  });

  onUnmounted(() => {
    if (resizeObserver && elementRef.value) {
      resizeObserver.unobserve(elementRef.value);
    }
  });
}
