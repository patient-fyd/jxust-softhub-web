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
    path: '/news/detail',
    name: 'NewsDetail',
    component: () => import('../views/NewsDetail.vue')
  },
  // 兼容旧路径，重定向到查询参数方式
  {
    path: '/news/:id',
    redirect: to => {
      return { path: '/news/detail', query: { newsId: to.params.id } }
    }
  },
  {
    path: '/blog',
    name: 'Blog',
    component: () => import('../views/Blog.vue')
  },
  {
    path: '/blog/detail',
    name: 'BlogDetail',
    component: () => import('../views/BlogDetail.vue')
  },
  {
    path: '/blog/:id',
    redirect: to => {
      return { path: '/blog/detail', query: { blogId: to.params.id } }
    }
  },
  {
    path: '/blog/editor',
    name: 'BlogEditor',
    component: () => import('../views/blog/editor.vue'),
    meta: { 
      requiresAuth: true,
      fullscreen: true // 标记为全屏页面，不显示导航栏和页脚
    }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('../views/Activities.vue')
  },
  {
    path: '/activity/detail',
    name: 'ActivityDetail',
    component: () => import('../views/ActivityDetail.vue')
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
    component: () => import('../views/Resources.vue') // 暂时使用News组件，后续可以创建专门的Resources组件
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
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/Home.vue')  // 暂时重定向到首页
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/Home.vue')  // 暂时重定向到首页
  },
  {
    path: '/team',
    name: 'Team',
    component: () => import('../views/Home.vue')  // 暂时重定向到首页
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/Home.vue')  // 暂时重定向到首页
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('../views/Home.vue')  // 暂时重定向到首页
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('../views/Home.vue')  // 暂时重定向到首页
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('../views/Home.vue')  // 暂时重定向到首页
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('../views/Home.vue')  // 暂时重定向到首页
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  // 处理博客详情页面的特殊情况
  if (to.path === '/blog/detail') {
    const blogId = to.query.blogId;
    if (!blogId || blogId === 'undefined' || blogId === 'null' || blogId === 'NaN') {
      console.warn('检测到无效的博客ID:', blogId);
      next({ name: 'Blog' }); // 重定向到博客列表页
      return;
    }
  }
  
  // 处理新闻详情页面的特殊情况
  if (to.path === '/news/detail') {
    const newsId = to.query.newsId;
    if (!newsId || newsId === 'undefined' || newsId === 'null' || newsId === 'NaN') {
      console.warn('检测到无效的新闻ID:', newsId);
      next({ name: 'News' }); // 重定向到新闻列表页
      return;
    }
  }
  
  // 处理活动详情页面的特殊情况
  if (to.path === '/activity/detail') {
    const activityId = to.query.id;
    if (!activityId || activityId === 'undefined' || activityId === 'null' || activityId === 'NaN') {
      console.warn('检测到无效的活动ID:', activityId);
      next({ name: 'Activities' }); // 重定向到活动列表页
      return;
    }
  }
  
  // 检查是否需要登录权限
  if (to.meta.requiresAuth) {
    // 从localStorage获取token判断是否已登录
    const token = localStorage.getItem('token');
    if (!token) {
      // 未登录，重定向到登录页面
      next({
        name: 'Login',
        query: { redirect: to.fullPath } // 登录后重定向回原页面
      });
      return;
    }
  }
  
  next();
})

export default router