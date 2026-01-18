<script setup lang="ts">
import { ref } from "vue";
import useResizeObserver from "@/composables/useResizeObserver";

const onContainerResize = (entries: ResizeObserverEntry[]): void => {
  patchWindowWidth.value = entries[0]!.contentRect.width;
  patchWindowHeight.value = entries[0]!.contentRect.height;
};

useResizeObserver("patchWindowContainer", onContainerResize);

const patchWindowWidth = ref(0);
const patchWindowHeight = ref(0);

</script>

<template>
  <v-app>
    <v-main>
      <v-container class="d-flex align-center justify-center">
        <div ref="patchWindowContainer" class="patch-window-container">
          <PatchWindow :height="patchWindowHeight" :width="patchWindowWidth" />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.patch-window-container {
  height: 80vh;
  width: 90vw;
}
</style>
