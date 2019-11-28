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
		const _to = Object.assign({}, to);
		delete _to.matched;
		let locale = localStorage.getItem(
			"signp-" + store.state.startPointInfo.project_id + ":locale"
		);
		if (!locale) {
			locale = "zh_CN";
		}
		Vue.http.put(Vue.apiHost + "/project/spm", {
			to: _to,
			entrance: {
				map_gid: store.state.startPointInfo.map_gid,
				locale: locale,
				agent: store.state.navigator.userAgent,
				user: store.state.userId
			},
			projectID: store.state.startPointInfo.project_id,
			timestamp: parseInt(new Date().getTime() / 1000)
		});
		next();
	} else {
		next({ path: "/", replace: true });
		store.commit("updateIsBack", false);
	}
});
export default router;
