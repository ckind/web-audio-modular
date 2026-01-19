<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);
const localOptions = ref({
  channel: props.options.channel,
  control: props.options.control,
});
const listening = ref(false);

watch(
  () => props.options,
  (newValue) => {
    localOptions.value = {
      channel: newValue.channel,
      control: newValue.control,
    };
    listening.value = newValue.listenForChannelAndControl;
  },
);

watch(
  () => localOptions.value,
  (newValue) => {
    emit("options-updated", newValue);
  },
);

const listen = () => {
  listening.value = true;
  emit("options-updated", { listenForChannelAndControl: true });
};
</script>

<template>
  <div>
    <v-btn :disabled="listening" density="compact" @click="listen" class="mr-2">
      {{ listening ? "Listening..." : "Listen" }}
    </v-btn>
    <patch-module-options-input
      :disabled="listening"
      v-model="localOptions"
    ></patch-module-options-input>
  </div>
</template>
