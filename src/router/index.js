import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";
import {ROLE_ADMIN} from "@/utils/constants";
import Movie from "@/components/user/MainPage";
import MovieView from "@/components/movie/MovieView"
import BookView from "@/components/book/BookView"
import GameView from "@/components/game/GameView"
import UserPage from "@/components/admin/UserPage";

Vue.use(VueRouter);

const router = new VueRouter({
	mode: 'history',
	routes: [
		{
			path: '/', redirect:'/movie/list'
		},
		{
			path: '/movie', component: Movie,
			redirect:'/movie/list',
			children: [
				{
					path: 'list',
				},
				{
					path: ':id', component: MovieView
				},
				{
					path:'list/rated',
				},
				{
					path: 'list/futured',
				},
				{
					path: 'list/search',
				},
				{
					path: 'list/recommended',
				}]
		},
		{
			path: '/game', component: Movie,
			redirect: '/game/list',
			children: [
				{
					path: 'list', props: (route) => ({page: route.query.page})
				},
				{
					path: ':id', component: GameView
				},
				{
					path:'list/rated', props: (route) => ({page: route.query.page})
				},
				{
					path: 'list/futured', props: (route) => ({page: route.query.page})
				},
				{
					path: 'list/search', props: (route) => ({page: route.query.page})
				},
				{
					path: 'list/recommended',
				}]
		},
		{
			path: '/book', component: Movie,
			redirect: '/book/list',
			children: [
				{
					path: 'list',
				},
				{
					path: ':id', component: BookView
				},
				{
					path:'list/rated',
				},
				{
					path: 'list/futured',
				},
				{
					path: 'list/search',
				},
				{
					path: 'list/recommended',
				}]
		},
		{
			path: '/admin/movie/list', component: UserPage
		},
		{
			path: '/*', redirect: '/movie/list'
		}
	],
});

router.beforeEach((to, from, next) => {
	let role = store.getters['security/role'];
	if (role === ROLE_ADMIN) {
		let newRoute = '/admin' + to;
		next(newRoute);
	}
	else if (to.fullPath.startsWith('/admin') && role !== ROLE_ADMIN) {
		next(false);
	} else {
		next();
	}
});

export default router;
