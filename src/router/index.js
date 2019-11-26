import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";
import Home from "../views/Home.vue";
import Help from "../views/Help.vue";
import Attractions from "../views/Attractions.vue";
import Recommend from "../views/Recommend.vue";
import Article from "../views/Article.vue";
import About from "../views/About.vue";
import Details from "../views/Details.vue";
import Search from "../views/Search.vue";
import AttractionSurrounding from "../views/AttractionSurrounding.vue";
import Surrounding from "../views/Surrounding.vue";
import Map from "../views/Map.vue";
import Route from "../views/Route.vue";

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
		next();
	} else {
		next({ path: "/", replace: true });
		store.commit("updateIsBack", false);
	}
});
export default router;
