<script setup lang="ts">
import { ref, watch } from "vue";
import { useAppColors } from "@/store/appColors";

const appColors = useAppColors();

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["options-updated"]);

const selectedDeviceId = ref(props.options.selectedDeviceId);

watch(selectedDeviceId, (newValue) => {
  console.log("Selected MIDI device ID changed:", newValue);
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
