import { createRouter, createWebHistory } from "vue-router";
import Patch from "@/views/Patch.vue"; 
import Overview from "@/views/Overview.vue";

const routes = [
  { path: "/", name: "Patch", component: Patch },
  { path: "/overview", name: "Overview", component: Overview },
];

const router = createRouter({
  history: createWebHistory(), // Use HTML5 history mode
  routes, // Short for `routes: routes`
});

export default router;
