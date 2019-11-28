import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const socketMessageIgnore = ["updateMessage", "updateKeywords"];

export default new Vuex.Store({
	state: {
		navigator: window.navigator,
		isWx:
			window.navigator.userAgent.toLowerCase().indexOf("micromessenger") > -1,
		startPointInfo: window.startPointInfo,
		dataLoaded: false,
		db: null,
		history: [],
		isBack: false,
		isSearchPointAround: false,
		windowHeight: 0,
		windowWidth: 0,
		surrounding: null,
		searchKeywords: null,
		currentRoute: null,
		socketMessage: null,
		userId: new Date().getTime()
	},
	mutations: {
		SOCKET_new_msg(state, value) {
			const msg = JSON.parse(value);
			if (msg && socketMessageIgnore.indexOf(msg.cmd) === -1) {
				msg._timestamp = new Date().getTime();
				state.socketMessage = msg;
			}
		},
		clearSocketMessage(state) {
			state.socketMessage = null;
		},
		updateSearchKeywords(state, value) {
			state.searchKeywords = value;
		},
		updateCurrentRoute(state, value) {
			state.currentRoute = value;
		},
		updateSurrounding(state, value) {
			state.surrounding = value;
		},
		updateWindowWidth(state, value) {
			state.windowWidth = value;
		},
		updateWindowHeight(state, value) {
			state.windowHeight = value;
		},
		updateIsSearchPointAround(state, value) {
			state.isSearchPointAround = value;
		},
		updateEquipmentCode(state, value) {
			state.equipmentCode = value;
		},
		updateDataLoaded(state, value) {
			state.dataLoaded = value;
		},
		updateIsBack(state, value) {
			state.isBack = value;
		},
		pushHistory(state, value) {
			state.history.push(value);
		},
		clearHistory(state) {
			state.history = [];
		},
		initDB(state, value) {
			state.db = value;
		}
	},
	actions: {
		getBackPath() {
			const path = this.state.history.pop();
			return path ? path : "/";
		}
	},
	modules: {}
});
