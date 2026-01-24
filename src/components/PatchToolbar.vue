<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  width: {
    type: Number,
    required: true,
  },
  borderColor: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["save", "load", "clear"]);

const showClearConfirm = ref(false);

const onClearRequested = () => {
  showClearConfirm.value = true;
};

const onConfirmClear = () => {
  showClearConfirm.value = false;
  emit("clear");
};
</script>

<template>
  <div
    class="d-flex justify-center mb-4"
    :style="{ width: width + 'px', borderColor: borderColor }"
  >
    <v-btn class="mx-2" @click="emit('save')">Save Patch</v-btn>
    <v-btn class="mx-2" @click="emit('load')">Load Patch</v-btn>
    <v-btn class="mx-2" @click="onClearRequested"> Clear Patch </v-btn>
  </div>

  <v-dialog v-model="showClearConfirm" max-width="360">
    <v-card>
      <v-card-title>Clear Patch</v-card-title>
      <v-card-text>
        Any unsaved work will be lost. Are you sure you want to continue?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="showClearConfirm = false">Cancel</v-btn>
        <v-btn color="error" variant="text" @click="onConfirmClear"
          >Continue</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
