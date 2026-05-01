import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";

import App from "./App.vue";
import router from "./app/router";
import { queryClientConfig } from "./shared/lib/query";

import "./shared/styles/tokens.css";
import "./shared/styles/main.css";

async function bootstrap() {
  const app = createApp(App);

  app.use(createPinia());
  app.use(router);
  app.use(VueQueryPlugin, {
    queryClientConfig
  });

  app.mount("#app");
}

bootstrap();
