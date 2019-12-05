import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";
import Details from "../views/Details.vue";
import Route from "../views/Route.vue";
import Map from "../views/Map.vue";
import AttractionSurrounding from "../views/AttractionSurrounding.vue";
import Surrounding from "../views/Surrounding.vue";
import Search from "../views/Search.vue";
import About from "../views/About.vue";
import Article from "../views/Article.vue";
import Attractions from "../views/Attractions.vue";
import Vr from "../views/Vr.vue";
import Recommend from "../views/Recommend.vue";
import Help from "../views/Help.vue";
import Home from "../views/Home.vue";
Vue.use(VueRouter);

const routes = [
	{
		path: "/details/:map_gid",
		name: "details",
		component: Details
	},
	{
		path: "/route",
		name: "route",
		component: Route
	},
	{
		path: "/map",
		name: "map",
		component: Map
	},
	{
		path: "/attractionSurrounding",
		name: "attractionSurrounding",
		component: AttractionSurrounding
	},
	{
		path: "/surrounding",
		name: "surrounding",
		component: Surrounding
	},
	{
		path: "/search",
		name: "search",
		component: Search
	},
	{
		path: "/about",
		name: "about",
		component: About
	},
	{
		path: "/article/:id",
		name: "article",
		component: Article
	},
	{
		path: "/attractions",
		name: "attractions",
		component: Attractions
	},
	{
		path: "/vr",
		name: "vr",
		component: Vr
	},
	{
		path: "/recommend",
		name: "recommend",
		component: Recommend
	},
	{
		path: "/help",
		name: "help",
		component: Help
	},
	{
		path: "/",
		name: "home",
		component: Home
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
		Vue.http.put(
			Vue.apiHost + "/project/spm",
			{
				type: "router",
				content: JSON.stringify({
					to: _to,
					map_gid: store.state.startPointInfo.map_gid,
					locale: locale,
					agent: store.state.navigator.userAgent
				}),
				contentType: "json",
				tag: store.state.userId,
				projectID: store.state.startPointInfo.project_id,
				timestamp: parseInt(new Date().getTime() / 1000)
			},
			{
				emulateJSON: false
			}
		);
		next();
	} else {
		next({ path: "/", replace: true });
		store.commit("updateIsBack", false);
	}
});
export default router;
