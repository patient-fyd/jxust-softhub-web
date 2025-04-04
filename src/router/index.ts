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
    path: '/blog',
    name: 'Blog',
    redirect: '/news?category=技术分享&from=blog'
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: () => import('../views/News.vue'),
    props: true
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
    path: '/moments',
    name: 'Moments',
    component: () => import('../views/Moments.vue')
  },
  {
    path: '/publish-moment',
    name: 'PublishMoment',
    component: () => import('../views/PublishMoment.vue')
  },
  {
    path: '/resources',
    name: 'Resources',
    component: () => import('../views/News.vue') // 暂时使用News组件，后续可以创建专门的Resources组件
  },
  {
    path: '/join',
    name: 'Join',
    component: () => import('../views/Join.vue')
  },
  {
    path: '/join/application-status',
    name: 'JoinApplicationStatus',
    component: () => import('../views/JoinApplicationStatus.vue')
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
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('../views/Practice.vue')
  },
  {
    path: '/practice/problem/:id',
    name: 'ProblemDetail',
    component: () => import('../views/ProblemDetail.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router