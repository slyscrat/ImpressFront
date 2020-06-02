export const REG = "REG";
export const AUTH = "AUTH";
export const CLEAN = "CLEAN";

const state = {
    register: "",
    authorization: ""
};

const getters = {
    register: state => {
        return state.register
    },
    authorization: state => {
        return state.authorization
    }
};

const mutations = {
    [REG](state) {
        Object.assign(state, {
            register: 1,
            authorization: 0
        });
    },

    [AUTH](state) {
        Object.assign(state, {
            register: 0,
            authorization: 1
        });
    },

    [CLEAN](state) {
        Object.assign(state, {
            register: 0,
            authorization: 0
        })
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
