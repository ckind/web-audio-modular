<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["options-updated"]);

const stringOptions = ref<Record<string, string>>({
  ...props.options,
});

const shallowEqual = (
  a: Record<string, any>,
  b: Record<string, any>,
): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }

  return true;
};

watch(
  () => props.options,
  (newOptions) => {
    const nextOptions = { ...newOptions } as Record<string, any>;
    if (!shallowEqual(stringOptions.value, nextOptions)) {
      stringOptions.value = nextOptions;
    }
  },
  { deep: true },
);

watch(
  stringOptions,
  (newStringOptions) => {
    const newOptions: Record<string, any> = { ...props.options };
    for (const key in newStringOptions) {
      if (typeof props.options[key] === "number") {
        const num = parseFloat(newStringOptions[key]!);
        if (isNaN(num)) {
          console.warn(
            "invalid number input for option",
            key,
            ":",
            newStringOptions[key],
          );
          continue; // Skip invalid number inputs
        }
        newOptions[key] = num;
      } else {
        newOptions[key] = newStringOptions[key];
      }
    }
    if (!shallowEqual(props.options as Record<string, any>, newOptions)) {
      emit("options-updated", newOptions);
    }
  },
  { deep: true },
);
</script>

<template>
  <input
    :disabled="disabled"
    v-for="(value, key) in stringOptions"
    :key="key"
    type="text"
    v-model.lazy="stringOptions[key]"
    @dblclick.stop=""
    placeholder="..."
    class="module-option-input mr-2 d-inline-block"
  />
</template>

<style scoped>
.module-option-input {
  field-sizing: content;
}
</style>
