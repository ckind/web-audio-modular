<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import type { MessageBoxModuleOptions } from "@/classes/audio-modules/MessageBoxModule";

const props = defineProps({
  options: {
    type: Object as PropType<MessageBoxModuleOptions>,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);
const message = ref<string | undefined>("");

watch(
  () => props.options.message,
  (newValue) => {
    message.value = newValue?.toString();
  },
);

watch(message, (newValue) => {
  emit("options-updated", {
    ...props.options,
    message: newValue,
  });
});
</script>

<template>
  <div class="display-message">
    <input
      placeholder="enter message..."
      type="text"
      v-model.lazy="message"
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
