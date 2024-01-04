import { createApp } from 'vue';
import App from '@/layouts/AppLayout.vue';
import router from '@/router';
import '@/assets/styles/app.scss';

const app = createApp(App);
app.use(router).mount('#app');
