import { createRouter, createWebHistory } from 'vue-router';
import Game from '@/components/Game.vue';

const routes = [
	{
		path: '/',
		name: 'game_page',
		component: Game
	},
	{
		path: '/:catchAll(.*)',
		redirect: '/'
	}
];

const router = createRouter({
	history: createWebHistory(),
	routes
});

export default router;
