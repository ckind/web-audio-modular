import {
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  type ComponentPublicInstance,
  type Ref,
  toValue,
} from "vue";

// hack to get the actual element from the template ref
// since it can be a component or an element
const unrefElement = (elRef: Ref<any>) => {
  const plain = toValue(elRef);
  return (plain as ComponentPublicInstance)?.$el ?? plain;
};

export default function useDynamicSize(refName: string) {
  const elementRef = useTemplateRef<HTMLElement>(refName);
  let resizeObserver: ResizeObserver | null = null;

  const width = ref(0);
  const height = ref(0);

  onMounted(() => {
    const element = unrefElement(elementRef);
    if (element) {
      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.target === element) {
            width.value = entry.contentRect.width;
            height.value = entry.contentRect.height;
          }
        }
      });
      resizeObserver.observe(element);
    }
  });

  onUnmounted(() => {
    if (resizeObserver && elementRef.value) {
      resizeObserver.unobserve(elementRef.value);
    }
  });

  return { width, height };
}
