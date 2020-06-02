import Vue from "vue";
import Vuex from 'vuex'
import security from "@/store/modules/security";
import helpers from "@/store/modules/helpers";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		security,
		helpers
	}
})
