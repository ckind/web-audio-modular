<template>
  <div class="modules-page">
    <v-container class="modules-list py-8">
      <section class="mb-8">
        <h1 class="text-h4 font-weight-bold mb-4">Module Documentation</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Below is a list of all available modules in Web Audio Modular.
        </p>
      </section>

      <div
        v-for="category in groupedByCategory"
        :key="category.name"
        :id="'category-' + category.name"
        class="mb-8"
      >
        <h2 class="text-h6 font-weight-bold mb-4 text-capitalize">
          {{ category.name }}
        </h2>
        <v-row>
          <v-col v-for="module in category.modules" :key="module.type" cols="12">
            <v-card 
              :id="'module-' + module.type"
              class="h-100" 
              variant="outlined">
            <v-card-item>
              <div class="text-h6 font-weight-bold">{{ module.title }}</div>
            </v-card-item>

            <v-divider></v-divider>

            <v-card-text>
              <p class="text-body-2 mb-3">
                {{ module.description || "[Add module description]" }}
              </p>

              <div
                class="mb-3"
                v-if="
                  module.inputDescriptions && module.inputDescriptions.length
                "
              >
                <div class="text-subtitle-2 font-weight-medium mb-2">
                  Inputs
                </div>
                <div
                  v-for="input in module.inputDescriptions"
                  :key="input.name"
                  class="mb-2 d-flex align-start pl-4"
                >
                  <div class="font-weight-bold mr-2">
                    <span v-if="input.type === 'signal'" class="text-secondary"
                      >~</span
                    >
                    {{ input.name }}
                  </div>
                  <div class=" text-medium-emphasis">
                    {{ input.description }}
                  </div>
                </div>
              </div>

              <div
                v-if="
                  module.outputDescriptions && module.outputDescriptions.length
                "
              >
                <div class="text-subtitle-2 font-weight-medium mb-2">
                  Outputs
                </div>
                <div
                  v-for="output in module.outputDescriptions"
                  :key="output.name"
                  class="mb-2 d-flex align-start pl-4"
                >
                  <div class=" font-weight-bold mr-2">
                    <span v-if="output.type === 'signal'" class="text-secondary"
                      >~</span
                    >
                    {{ output.name }}
                  </div>
                  <div class=" text-medium-emphasis">
                    {{ output.description }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>

  <!-- Right-side navigation menu -->
  <aside class="toc-sidebar">
    <div class="toc-content">
      <div class="toc-title  font-weight-bold mb-2">All Modules</div>
      <nav>
        <div v-for="category in groupedByCategory" :key="category.name" class="mb-3">
          <a 
            :href="'#category-' + category.name"
            class="toc-category-link  text-medium-emphasis"
            @click.prevent="scrollToElement('category-' + category.name)"
          >
            {{ category.name }}
          </a>
          <div class="toc-modules ml-3">
            <a 
              v-for="module in category.modules"
              :key="module.type"
              :href="'#module-' + module.type"
              class="toc-module-link  text-medium-emphasis"
              @click.prevent="scrollToElement('module-' + module.type)"
            >
              {{ module.title }}
            </a>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</div>
</template>

<script setup lang="ts">
import { availableModules } from "@/moduleDescriptors";
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const groupedByCategory = computed(() => {
  const groups: { [key: string]: typeof availableModules } = {};

  availableModules.forEach((module) => {
    const category = module.categories[0]!;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(module);
  });

  return Object.entries(groups).map(([name, modules]) => ({
    name,
    modules,
  }));
});

const scrollToElement = (id: string) => {
  // Update the URL hash
  router.replace({ hash: `#${id}` });
  
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
};

onMounted(() => {
  const hash = window.location.hash;
  if (hash) {
    // Remove the '#' and scroll to the element
    const id = hash.substring(1);
    // Add a small delay to ensure the DOM is fully rendered
    setTimeout(() => {
      scrollToElement(id);
    }, 100);
  }
});
</script>

<style scoped>
.modules-page {
  position: relative;
}

.modules-list {
  max-width: 1200px;
  margin: 0 auto;
  padding-right: 18em;
}

.toc-sidebar {
  position: fixed;
  top: 80px;
  right: 16px;
  width: 18em;
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  padding: 16px;
  border-left: 1px solid rgba(var(--v-border-color), 0.12);
}

.toc-content {
  position: sticky;
  top: 0;
}

.toc-title {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
}

.toc-category-link,
.toc-module-link {
  display: block;
  text-decoration: none;
  padding: 4px 0;
  transition: all 0.2s;
  border-left: 2px solid transparent;
  padding-left: 8px;
  margin-left: -8px;
}

.toc-category-link {
  font-weight: 600;
  text-transform: capitalize;
  margin-bottom: 4px;
}

.toc-module-link {}

.toc-category-link:hover,
.toc-module-link:hover {
  opacity: 1;
  border-left-color: rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-secondary));
}

.toc-modules {
  margin-bottom: 8px;
}

@media (max-width: 1200px) {
  .toc-sidebar {
    display: none;
  }
  
  .modules-list {
    padding-right: 16px;
  }
}
</style>
