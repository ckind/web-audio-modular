<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);
const isChannel2 = computed({
  get() {
    return props.options.channel === 2;
  },
  set(newValue) {
    emit("options-updated", { channel: newValue ? 2 : 1 });
  },
});
</script>

<template>
  <div class="d-flex align-center mx-5 my-1">
    <v-switch
      v-model="isChannel2"
      density="compact"
      hide-details
      size="x-small"
      @dblclick.stop
    />
  </div>
</template>

<style scoped></style>
