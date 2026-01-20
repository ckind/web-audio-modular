import { createRouter, createWebHistory } from "vue-router";
import Patch from "@/views/Patch.vue"; 

const routes = [
  { path: "/", name: "Patch", component: Patch },
];

const router = createRouter({
  history: createWebHistory(), // Use HTML5 history mode
  routes, // Short for `routes: routes`
});

export default router;
