import { createRouter, createWebHistory } from "vue-router";
import Patch from "@/views/Patch.vue"; 
import Overview from "@/views/Overview.vue";
import Modules from "@/views/Modules.vue";

const routes = [
  { path: "/", name: "Patch", component: Patch },
  { path: "/overview", name: "Overview", component: Overview },
  { path: "/modules", name: "Modules", component: Modules },
];

const router = createRouter({
  history: createWebHistory(), // Use HTML5 history mode
  routes, // Short for `routes: routes`
});

export default router;
