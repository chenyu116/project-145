import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";

Vue.use(VueRouter);

const routes = [
	{
		path: "/details/:map_gid",
		name: "details",
		component: () => import("../views/Details.vue")
	},
	{
		path: "/route",
		name: "route",
		component: () => import("../views/Route.vue")
	},
	{
		path: "/map",
		name: "map",
		component: () => import("../views/Map.vue")
	},
	{
		path: "/attractionSurrounding",
		name: "attractionSurrounding",
		component: () => import("../views/AttractionSurrounding.vue")
	},
	{
		path: "/surrounding",
		name: "surrounding",
		component: () => import("../views/Surrounding.vue")
	},
	{
		path: "/search",
		name: "search",
		component: () => import("../views/Search.vue")
	},
	{
		path: "/about",
		name: "about",
		component: () => import("../views/About.vue")
	},
	{
		path: "/article/:id",
		name: "article",
		component: () => import("../views/Article.vue")
	},
	{
		path: "/attractions",
		name: "attractions",
		component: () => import("../views/Attractions.vue")
	},
	{
		path: "/vr",
		name: "vr",
		component: () => import("../views/Vr.vue")
	},
	{
		path: "/recommend",
		name: "recommend",
		component: () => import("../views/Recommend.vue")
	},
	{
		path: "/help",
		name: "help",
		component: () => import("../views/Help.vue")
	},
	{
		path: "/",
		name: "home",
		component: () => import("../views/Home.vue")
	}
];

const router = new VueRouter({
	routes
});
router.beforeEach((to, from, next) => {
	if (to.matched.length > 0) {
		if (to.path === "/") {
			store.commit("clearHistory");
			store.commit("updateIsBack", false);
		} else {
			if (!store.state.isBack) {
				store.commit("pushHistory", from.path);
			} else {
				store.commit("updateIsBack", false);
			}
		}
		next();
	} else {
		next({ path: "/", replace: true });
		store.commit("updateIsBack", false);
	}
});
export default router;
