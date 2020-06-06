import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";
import {ROLE_ADMIN} from "@/utils/constants";
import HelloWorld2 from "@/components/HelloWorld2";
import Movie from "@/components/user/Movie";
import ItemView from "@/components/common/ItemView"

Vue.use(VueRouter);

const router = new VueRouter({
	mode: 'history',
	routes: [
		{
			path: '/', redirect:'/movie/list'
		},
/*		{path: '/!*!/list/recommended', component: Movie},
		{path: '/!*!/list/rated', component: Movie},
		{path: '/!*!/list/futured', component: Movie},
		{path: '/!*!/list/search', component: Movie},*/
		{
			path: '/movie', component: Movie,
			children: [
				{
					path: 'list', component: Movie,
					children: [
						{
							path:'rated',
							component: Movie
						},
						{
							path: 'futured',
							component: Movie
						},
						{
							path: 'search',
							component: Movie
						}]
				},
				{
					path: ':id', component: ItemView
				}]
		},
		{
			path: '/game', component: Movie,
			children: [
				{
					path: 'list', component: Movie,
					children: [
						{
							path:'rated',
							component: Movie
						},
						{
							path: 'futured',
							component: Movie
						},
						{
							path: 'search',
							component: Movie
						}]
				},
				{
					path: ':id', component: ItemView
				}]
		},
		{
			path: '/book', component: Movie,
			children: [
				{
					path: 'list', component: Movie,
					children: [
						{
							path:'rated',
							component: Movie
						},
						{
							path: 'futured',
							component: Movie
						},
						{
							path: 'search',
							component: Movie
						}]
				},
				{
					path: ':id', component: ItemView
				}]
		},
		{
			path: '/admin/movie/list', component: HelloWorld2
		},
	],
});

/*{
	path: '/game/list', component: Movie,
	children: [{
	path:'rated',
	component: Movie
},
	{
		path: 'futured',
		component: Movie
	},
	{
		path: 'search',
		component: Movie
	}]
},*/

router.beforeEach((to, from, next) => {
	let role = store.getters['security/role'];
	if (to.fullPath.startsWith('/admin') && role !== ROLE_ADMIN) {
		next(false);
	} else {
		next();
	}
});

export default router;
