<template>
  <v-app>
    <v-main>
      <v-container class="fill-height d-flex align-center" max-width="900">
        <PatchWindow :height="800" :width="1200" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { createAudioModule } from "./classes/factory/AudioModuleFactory";
import useAudioGlobalContext from "@/composables/useAudioGlobalContext";

useAudioGlobalContext((ctx: AudioContext) => {
  // example fm patch

  // const dst = createAudioModule("speaker-output", "1", ctx);
  // const modulator = createAudioModule("oscillator", "2", ctx);
  // const gain = createAudioModule("gain", "3", ctx, { gain: 1000 });
  // const carrier = createAudioModule("oscillator", "4", ctx);

  // modulator.outputs[0]!.connect(gain.inputs[0]!);
  // gain.outputs[0]!.connect(carrier.inputs[0]!);
  // carrier.outputs[0]!.connect(dst.inputs[0]!);
});
</script>
