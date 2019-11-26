import "babel-polyfill";
import Promise from "bluebird";
import Vue from "vue";
import VueAMap from "vue-amap";
import App from "./App.vue";
import VueResource from "vue-resource";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify.js";
import VueI18n from "vue-i18n";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@fortawesome/fontawesome-free/css/all.css";
import preview from "vue-photo-preview";
import "vue-photo-preview/dist/skin.css";
import VuePannellum from "vue-pannellum";
import HeaderWithBack from "@/components/HeaderWithBack.vue";
import WechatJSSDK from "wechat-jssdk/dist/client.umd";
import VueSocketIO from "vue-socket.io";
import "./scss/variables.scss";
Vue.config.productionTip = false;
const apiHost = "http://192.168.1.189/v2";
const ossHost = "https://192.168.1.189/";
Vue.apiHost = apiHost;
Vue.prototype.apiHost = apiHost;
Vue.prototype.ossHost = ossHost;
const wechat = new WechatJSSDK(window.wxJsApi);
wechat.initialize();
Vue.prototype.$wechat = wechat;
Promise.config({
	// Enable warnings
	warnings: false,
	// Enable long stack traces
	longStackTraces: false,
	// Enable cancellation
	cancellation: false,
	// Enable monitoring
	monitoring: false,
	// Enable async hooks
	asyncHooks: true
});
window.Promise = Promise;
Vue.use(preview, { fullscreenEl: false, zoomEl: false });
Vue.use(VueI18n);
Vue.use(VueResource);
Vue.use(VueAMap);
Vue.component("VPannellum", VuePannellum);
Vue.component("HeaderWithBack", HeaderWithBack);
VueAMap.initAMapApiLoader({
	key: "aa74543d9696262bcfef28f130a08fe2",
	plugin: [
		"Autocomplete",
		"PlaceSearch",
		"OverView",
		"ToolBar",
		"Driving",
		"Walking",
		"Geocoder",
		"Geolocation",
		"MarkerClusterer"
	],
	// 默认高德 sdk 版本为 1.4.4
	v: "1.4.4"
});
Vue.http.options.emulateJSON = true;
Vue.http.options.emulateHTTP = true;
Vue.http.options.timeout = 10000;
if (store.state.startPointInfo.debug === true) {
	Vue.http.headers.common["x-refresh"] = "1";
}
Vue.prototype.changePoint = function(point) {
	if (point.indexOf("POINT(") !== 0) return false;
	let replacePoint = point.replace("POINT(", "");
	replacePoint = replacePoint.replace(")", "");
	replacePoint = replacePoint.replace(" ", ",");
	replacePoint = replacePoint.split(",");
	return [Number(replacePoint[0]), Number(replacePoint[1])];
};
const vueSocketIO = new VueSocketIO({
	debug: false,
	connection: "http://192.168.1.189",
	vuex: {
		store,
		actionPrefix: "SOCKET_",
		mutationPrefix: "SOCKET_"
	},
	options: { path: "/" } //Optional options
});
vueSocketIO.io.on("connect", function() {
	vueSocketIO.io.emit(
		"login",
		window.startPointInfo.project_id + "|mobile|" + new Date().toLocaleString()
	);
});
Vue.use(vueSocketIO);
const i18n = new VueI18n({
	locale: "zh_CN" || "en_US",
	fallbackLocale: "zh_CN" || "en_US",
	messages: {}
});
new Vue({
	router,
	store,
	vuetify,
	i18n,
	render: h => h(App)
}).$mount("#app");
