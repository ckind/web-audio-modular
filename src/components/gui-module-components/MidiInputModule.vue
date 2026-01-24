<script setup lang="ts">
import { ref, watch, nextTick, type PropType } from "vue";
import type { MidiInputModuleOptions } from "@/classes/audio-modules/MidiInputModule";

const props = defineProps({
  options: {
    type: Object as PropType<MidiInputModuleOptions>,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);

const selectedDeviceId = ref(props.options.selectedDeviceId);
const isSyncing = ref(false);

watch(
  () => props.options.selectedDeviceId,
  async (newValue) => {
    if (selectedDeviceId.value === newValue) return;
    isSyncing.value = true;
    selectedDeviceId.value = newValue;
    await nextTick();
    isSyncing.value = false;
  },
  { immediate: true },
);

watch(selectedDeviceId, (newValue) => {
  if (isSyncing.value) return;
  emit("options-updated", { selectedDeviceId: newValue });
});
</script>

<template>
  <v-select
    class="ma-2 midi-device-select"
    density="compact"
    label="midi device"
    hide-details
    item-title="name"
    item-value="id"
    :items="options.availableDevices"
    v-model="selectedDeviceId"
  ></v-select>
</template>

<style scoped>
.midi-device-select {
  min-width: 10em;
}
</style>
