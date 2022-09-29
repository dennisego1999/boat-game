import { createApp } from 'vue';
import App from './App.vue';

import '@/assets/styles/tailwind.css'
import '@/assets/styles/app.scss';

const app = createApp(App);
app.mount('#app');
