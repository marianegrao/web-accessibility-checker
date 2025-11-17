import { createWebHistory, createRouter } from "vue-router";

import WebAccessibilityPage from "@/modules/web/views/WebAccessibilityPage.vue";
import WebHistoryPage from "@/modules/web/views/WebHistoryPage.vue";

const routes = [
  { path: "/", component: WebAccessibilityPage },
  { path: "/history", component: WebHistoryPage },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
