<script setup lang="ts">
import { computed, ref } from "vue";
import { type ModuleDescriptor, availableModules } from "@/moduleDescriptors";

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

const addModule = (moduleType: string, GUIComponent?: string) => {
  emit("add-module", moduleType, GUIComponent);
  showAddModuleDialog.value = false;
};

const openAddModuleDialog = () => {
  showAddModuleDialog.value = true;
};

const showHelp = (moduleType: string) => {
  console.log(`Help requested for module type: ${moduleType}`);
};

const searchTerm = ref("");

const filteredModules = computed(() => {
  const needle = searchTerm.value?.trim().toLowerCase() ?? "";
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

const addModuleDialogWidth = computed(() =>
  Math.max(window.innerWidth * 0.4, 400),
);
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
    :width="addModuleDialogWidth"
    height="85vh"
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
          <div
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
              v-for="module in group.modules"
              :key="module.type"
              :value="module.type"
              @click="addModule(module.type, module.GUIComponent)"
              class="cursor-pointer"
            >
              <v-list-item-title>{{ module.title }}</v-list-item-title>
              <template #append>
                <v-icon
                  @click.stop="showHelp(module.type)"
                  size="small"
                  class="text-secondary"
                  >mdi-help-circle-outline</v-icon
                >
              </template>
            </v-list-item>
          </div>

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
