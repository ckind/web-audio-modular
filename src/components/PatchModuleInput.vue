<script setup lang="ts">
import { type PropType, computed } from "vue";
import type { ConnectionType } from "@/types/connectionTypes";
import useConnectionTypeColors from "@/composables/useConnectionTypeColors";

const { signalColor, messageBusColor } = useConnectionTypeColors();

const nodeColor = computed(() => {
  return props.type === "signal" ? signalColor : messageBusColor;
});

const props = defineProps({
  type: {
    type: String as PropType<ConnectionType>,
    required: true,
  },
});
</script>

<template>
  <svg
    v-bind="props"
    xmlns="http://www.w3.org/2000/svg"
    width="5"
    height="5"
    viewBox="0 0 5 5"
    class="module-input"
  >
    <circle cx="0" cy="0" r="5" :fill="nodeColor" />
    <!-- ghost anchor to increase hitbox size for easier selection -->
    <circle cx="0" cy="0" r="15" fill="#fff" fill-opacity="0" />
  </svg>
</template>

<style scoped>
.module-input {
  cursor: pointer;
}
</style>
