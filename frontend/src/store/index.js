import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLoggedIn: false,
    nombre_usuario: ''
  },
  getters: {
  },
  mutations: {
    login(state, nombre_usuario) {
      state.isLoggedIn = true;
      state.nombre_usuario = nombre_usuario;  // Almacena el nombre del usuario al iniciar sesión
    },
    logout(state) {
      state.isLoggedIn = false;
      state.nombre_usuario = '';  // Limpia el nombre del usuario al cerrar sesión
    }
  },
  actions: {
    login({ commit }, nombre_usuario) {
      commit('login', nombre_usuario);
    },
    logout({ commit }) {
      commit('logout');
    }
  },
  modules: {
  }
})
