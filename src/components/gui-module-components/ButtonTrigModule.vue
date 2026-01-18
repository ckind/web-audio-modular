<script setup lang="ts">
const trigMessage = "";

const emit = defineEmits(["options-updated"]);

const trig = () => {
  emit("options-updated", { trigMessage: trigMessage });
};
</script>

<template>
  <v-btn class="ma-3" density="compact" @dblclick.stop @click="trig"></v-btn>
</template>

<style scoped></style>
