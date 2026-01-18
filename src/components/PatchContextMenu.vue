<script setup lang="ts">
import { computed, ref } from "vue";

type ModuleDescriptor = {
  title: string;
  type: string;
  GUIComponent?: string;
  categories: string[];
};

const showContextMenu = defineModel({
  type: Boolean,
  required: true,
});

const showAddModuleDialog = ref(false);
const selectedCategories = ref<string[]>([]);

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

const availableModules: ModuleDescriptor[] = [
  {
    title: "oscillator",
    type: "oscillator",
    categories: ["sound-source", "signal"],
  },
  {
    title: "speaker-output",
    type: "speaker-output",
    categories: ["output", "signal"],
  },
  { title: "gain", type: "gain", categories: ["signal-operator", "signal"] },
  { title: "clock", type: "clock", categories: ["timing"] },
  { title: "logger", type: "logger", categories: ["utility"] },
  { title: "scale", type: "scale", categories: ["signal-operator", "signal"] },
  {
    title: "scale-exp",
    type: "scale-exp",
    categories: ["signal-operator", "signal"],
  },
  {
    title: "message-to-signal",
    type: "message-to-signal",
    categories: ["utility", "signal"],
  },
  {
    title: "sequence",
    type: "sequence",
    categories: ["timing", "message-bus"],
  },
  {
    title: "slider",
    type: "slider",
    GUIComponent: "SliderModule",
    categories: ["ui-control", "signal"],
  },
  {
    title: "display-message",
    type: "display-message",
    GUIComponent: "DisplayMessageModule",
    categories: ["utility", "message-bus"],
  },
  {
    title: "filter",
    type: "filter",
    categories: ["effect", "signal"],
  },
  {
    title: "convolution-reverb",
    type: "convolution-reverb",
    categories: ["effect", "signal"],
  },
  {
    title: "button-trig",
    type: "button-trig",
    GUIComponent: "ButtonTrigModule",
    categories: ["ui-control", "message-bus"],
  },
  { title: "noise", type: "noise", categories: ["sound-source", "signal"] },
  {
    title: "adsr-envelope",
    type: "adsr-envelope",
    categories: ["envelope", "signal"],
  },
];

const addModule = (moduleType: string, GUIComponent?: string) => {
  emit("add-module", moduleType, GUIComponent);
  showAddModuleDialog.value = false;
};

const openAddModuleDialog = () => {
  showAddModuleDialog.value = true;
};

const searchTerm = ref("");

const filteredModules = computed(() => {
  const needle = searchTerm.value.trim().toLowerCase();
  const categories = selectedCategories.value;

  return availableModules.filter((module) => {
    const category = module.categories?.[0] ?? "other";
    const matchesCategory =
      categories.length === 0 || categories.includes(category);
    const matchesSearch =
      !needle || module.title.toLowerCase().includes(needle);
    return matchesCategory && matchesSearch;
  });
});

const categoryOptions = computed(() => {
  const seen = new Set<string>();
  for (const module of availableModules) {
    const category = module.categories?.[0] ?? "other";
    seen.add(category);
  }
  return Array.from(seen);
});

const groupedModules = computed(() => {
  const order: string[] = [];
  const buckets: Record<string, ModuleDescriptor[]> = {};

  for (const module of filteredModules.value) {
    const category = module.categories?.[0] ?? "other";
    if (!buckets[category]) {
      buckets[category] = [];
      order.push(category);
    }
    buckets[category].push(module);
  }

  return order.map((category) => ({ category, modules: buckets[category] }));
});
</script>

<template>
  <v-menu
    v-model="showContextMenu"
    :close-on-content-click="true"
    :style="{ left: `${x}px`, top: `${y}px` }"
  >
    <v-list>
      <v-list-item @click="openAddModuleDialog">
        <v-list-item-title>
          <v-icon>mdi-plus</v-icon>Add Module
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <v-dialog
    v-model="showAddModuleDialog"
    max-width="400"
    height="75vh"
    scrollable
  >
    <v-card>
      <v-card-title
        >Add Module

        <div class="mt-4">
          <v-text-field
            v-model="searchTerm"
            label="Search modules"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            density="comfortable"
            class="mb-2"
          />

          <v-chip-group
            v-model="selectedCategories"
            multiple
            column
            class="mb-3"
          >
            <v-chip
              v-for="category in categoryOptions"
              :key="category"
              :value="category"
              size="small"
              variant="outlined"
            >
              {{ category }}
            </v-chip>
          </v-chip-group>
        </div>
      </v-card-title>

      <v-card-text>
        <v-list>
          <template
            v-for="(group, groupIndex) in groupedModules"
            :key="group.category"
          >
            <div
              class="d-flex align-center my-2"
              :class="{ 'mt-4': groupIndex > 0 }"
            >
              <v-divider
                class="flex-grow-1"
                color="grey-darken-2"
                :thickness="2"
              />
              <span class="mx-3 text-caption text-high-emphasis text-no-wrap">{{
                group.category
              }}</span>
              <v-divider
                class="flex-grow-1"
                color="grey-darken-2"
                :thickness="2"
              />
            </div>

            <v-list-item
              v-for="(module, index) in group.modules"
              :key="`${group.category}-${index}`"
              :value="index"
              @click="addModule(module.type, module.GUIComponent)"
              class="cursor-pointer"
            >
              <v-list-item-title>{{ module.title }}</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item v-if="filteredModules.length === 0" disabled>
            <v-list-item-title>No modules found</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="text"
          @click="showAddModuleDialog = false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
