import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../views/News.vue')
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('../views/Activities.vue')
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('../views/Members.vue')
  },
  {
    path: '/join',
    name: 'Join',
    component: () => import('../views/Join.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPassword.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router