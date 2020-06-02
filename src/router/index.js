import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";
import {ROLE_ADMIN} from "@/utils/constants";
import HelloWorld2 from "@/components/HelloWorld2";
import Movie from "@/components/user/Movie";

Vue.use(VueRouter);

const router = new VueRouter({
	mode: 'history',
	routes: [
		{path: '/', redirect:'/movie/list'},
		{path: '/movie/list', component: Movie},
		{path: '/game/list', component: Movie},
		{path: '/book/list', component: Movie},
		{path: '/admin/movie/list', component: HelloWorld2},
	],
});

router.beforeEach((to, from, next) => {
	let role = store.getters['security/role'];
	if (to.fullPath.startsWith('/user') && role !== ROLE_ADMIN) {
		next(false);
	} else {
		next();
	}
});

export default router;
