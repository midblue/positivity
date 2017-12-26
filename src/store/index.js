import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: ''
  },
  mutations: {
    set (state, payload) {
    	for (let prop in payload)
    		state[prop] = payload[prop]
    }
  }
})