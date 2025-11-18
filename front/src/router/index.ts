import { createWebHistory, createRouter } from "vue-router";

import WebsiteAccessibilityPage from "@/modules/website/views/WebsiteAccessibilityPage.vue";
import WebsiteHistoryPage from "@/modules/website/views/WebsiteHistoryPage.vue";

const routes = [
  { path: "/", component: WebsiteAccessibilityPage },
  { path: "/history", component: WebsiteHistoryPage },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
