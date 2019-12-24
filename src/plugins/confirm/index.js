import Vue from "vue";
import vuetify from "../vuetify";
import ConfirmComponent from "./Confirm.vue";

const Confirm = {};
let node = null;
const ConfirmConstructor = Vue.extend(ConfirmComponent);
const baseOptions = {
	title: null,
	callback: null
};

let appEl;
Confirm.install = function(Vue) {
	Vue.prototype.$confirm = function(options) {
		if (node) return;
		if (!appEl) {
			appEl = document.getElementById("inspire");
		}
		if (!options || Object.keys(options).length === 0) {
			return;
		}
		const opt = Object.assign({}, baseOptions);
		for (let property in options) {
			opt[property] = options[property];
		}
		for (let property in opt) {
			if (opt[property] === null) return;
		}
		node = new ConfirmConstructor({
			vuetify,
			data: opt
		});
		node.$mount();
		appEl.appendChild(node.$el);
	};

	Vue.prototype.$confirm["hide"] = function() {
		node = null;
		try {
			appEl.removeChild(node.$el);
		} catch (e) {}
	};
};

export default Confirm;
