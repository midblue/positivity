import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    apiURL: './api',
    points: null,
    tournaments: null
  },
  mutations: {
    set (state, payload) {
    	for (let prop in payload)
    		state[prop] = payload[prop]
    }
  }
})