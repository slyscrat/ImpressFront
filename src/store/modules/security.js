import {NOT_AUTHENTICATED} from "@/utils/constants";

export const AUTHENTICATE = "AUTHENTICATE";
export const LOGOUT = "LOGOUT";
export const APPROVE = "APPROVE";

const state = {
	id: "",
	oldId: "",
	name: "",
	nickName: "",
	email: "",
	password: "",
	role: NOT_AUTHENTICATED,
	token: ""
};

const getters = {
	role: state => {
		return state.role
	},
	token: state => {
		return state.token
	},
	oldId: state => {
		return state.oldId
	},
	id: state => {
		return state.id
	},
	nickName: state => {
		return state.nickName
	}
};

const mutations = {
	[AUTHENTICATE](state, authCredentials) {
		Object.assign(state, authCredentials);
	},

	[APPROVE](state) {
		state.oldId = state.id;
	},

	[LOGOUT](state) {
		Object.assign(state, {
			id: "",
			oldId: "",
			name: "",
			nickName: "",
			email: "",
			password: "",
			role: NOT_AUTHENTICATED,
			token: "",
		});
	}
};

const actions = {};

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
}
