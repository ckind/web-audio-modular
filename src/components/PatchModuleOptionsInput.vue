<script setup lang="ts">
import { ref, watch, } from "vue";

const options = defineModel({
  type: Object,
  required: true,
});

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const stringOptions = ref<Record<string, string>>({
  ...options.value,
});

watch(
  () => options.value,
  (newOptions) => {
    stringOptions.value = { ...newOptions };
  },
  { deep: true },
);

watch(
  () => stringOptions.value,
  (newStringOptions) => {
    for (const key in newStringOptions) {
      if (typeof options.value[key] === "number") {
        const num = parseFloat(newStringOptions[key]!);
        if (isNaN(num)) {
          console.warn("invalid number input for option", key, ":", newStringOptions[key]);
          continue; // Skip invalid number inputs
        }
        options.value[key] = num;
      } else {
        options.value[key] = newStringOptions[key];
      }
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
