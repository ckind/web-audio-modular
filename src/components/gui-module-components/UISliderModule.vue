<script setup lang="ts">
import { computed } from "vue";
import { useAppColors } from "@/store/appColors";

const appColors = useAppColors();

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);
const value = computed({
  get() {
    return props.options.value;
  },
  set(newValue) {
    emit("options-updated", { value: Number(newValue) });
  },
});
</script>

<template>
  <div>
    <input
      v-model="value"
      type="range"
      :min="options.min"
      :max="options.max"
      :step="0.0001"
      :style="{ accentColor: appColors.signalColor }"
      @mousedown.stop
      @touchstart.stop
    />
  </div>
</template>

<style scoped>
input[type="range"] {
  writing-mode: vertical-lr;
  direction: rtl; /* This ensures higher values are at the top */
  width: 16px; /* Set an appropriate width/height */
  height: 100px; /* Set an appropriate width/height */
}
</style>
