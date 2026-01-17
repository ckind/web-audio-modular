<template>
  <v-app>
    <v-main>
      <v-container class="fill-height d-flex align-center">
        <PatchWindow :height="700" :width="1100" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { createAudioModule } from "@/classes/factory/AudioModuleFactory";
import useToneAutoResume from "@/composables/useToneAutoResume";

const test = () => {
  const oscillator = createAudioModule("oscillator", "1");
  const speakerOutput = createAudioModule("speaker-output", "2");

  oscillator.outputs[0]!.connect(speakerOutput.inputs[0]!);
};

// useToneAutoResume(test);


</script>
