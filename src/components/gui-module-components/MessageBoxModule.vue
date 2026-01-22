<script setup lang="ts">
import { watch, type PropType } from "vue";
import type { MessageBoxModuleOptions } from "@/classes/audio-modules/MessageBoxModule";

const props = defineProps({
  options: {
    type: Object as PropType<MessageBoxModuleOptions>,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);

watch(
  () => props.options.message,
  (newValue) => {
    emit("options-updated", { message: newValue });
  },
);
</script>

<template>
  <div class="display-message">
    <input
      placeholder="enter message..."
      type="text"
      v-model.lazy="props.options.message"
      @dblclick.stop=""
      class="message-input d-inline-block"
    />
  </div>
</template>

<style scoped>
.message-input {
  field-sizing: content;
}
.display-message {
  min-width: 2.6em;
  min-height: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
