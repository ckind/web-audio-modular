<script setup lang="ts">
import { watch } from "vue";

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);

watch(
  () => props.options.trigMessage,
  (newValue) => {
    emit("options-updated", { trigMessage: newValue });
  },
);
</script>

<template>
  <input
    placeholder="enter message..."
    type="text"
    v-model.lazy="props.options.trigMessage"
    @dblclick.stop=""
    class="message-input d-inline-block"
  />
</template>

<style scoped>
.message-input {
  field-sizing: content;
}
</style>
