<script setup lang="ts">
const showContextMenu = defineModel({
  type: Boolean,
  required: true,
});

const props = defineProps({
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["add-module"]);

const availableModules = [
  { title: "oscillator", type: "oscillator" },
  { title: "speaker-output", type: "speaker-output" },
  { title: "gain", type: "gain" },
  { title: "clock", type: "clock" },
  { title: "logger", type: "logger" },
  { title: "scale", type: "scale" },
];

const addModule = (moduleType: string) => {
  emit("add-module", moduleType);
};
</script>

<template>
  <v-menu
    v-model="showContextMenu"
    :close-on-content-click="true"
    :style="{ left: `${x}px`, top: `${y}px` }"
  >
    <v-list>
      <v-menu location="end">
        <template v-slot:activator="{ props }">
          <v-list-item @click="" v-bind="props">
            <v-list-item-title>
              <v-icon>mdi-plus</v-icon>Add Module
            </v-list-item-title>
          </v-list-item>
        </template>

        <v-list>
          <v-list-item
            v-for="(module, index) in availableModules"
            :key="index"
            :value="index"
            @click="addModule(module.type)"
          >
            <v-list-item-title>{{ module.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-list>
  </v-menu>
</template>
