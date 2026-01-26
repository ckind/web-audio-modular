<script setup lang="ts">
import { defineComponent } from "vue";

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="display-message">
    <span>{{ options.message }}</span>
  </div>
</template>

<style scoped>
.display-message {
  min-width: 2.6em;
  min-height: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
