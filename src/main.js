import { createApp } from 'vue';
import App from '@/Layouts/AppLayout.vue';
import router from '@/Router';
import './styles/app.scss';

const app = createApp(App);
app.use(router).mount('#app');
