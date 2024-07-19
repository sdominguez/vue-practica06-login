import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import UserView from '../views/UserView.vue'
import UserEditView from '../views/UserEditView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/user',
    name: 'user',
    component: UserView,
  },
  {
    path: '/user_edit',
    name: 'user_edit',
    component: UserEditView,
  }  
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
