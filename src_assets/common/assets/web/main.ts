import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from '@/App.vue';
import { createVibepolloI18n } from '@/i18n';
import router from '@/router';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import '@/styles/shell.css';
import '@/styles/views.css';
import '@/umbra/umbra.css';  // Umbra: colours, see that file
import { PRODUCT_NAME } from '@/umbra/edition';  // Umbra

const i18n = await createVibepolloI18n();

router.afterEach((route) => {
  const key = typeof route.meta.titleKey === 'string' ? route.meta.titleKey : 'ui.nav.overview';
  const title = i18n.global.t(key);
  document.title = route.path === '/' ? PRODUCT_NAME : `${title} · ${PRODUCT_NAME}`;  // Umbra: name
});

createApp(App).use(createPinia()).use(router).use(i18n).mount('#app');
