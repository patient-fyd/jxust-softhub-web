import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/home/Home.vue')
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../views/news/News.vue')
  },
  {
    path: '/news/detail',
    name: 'NewsDetail',
    component: () => import('../views/news/NewsDetail.vue')
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
    component: () => import('../views/blog/Blog.vue')
  },
  {
    path: '/blog/detail',
    name: 'BlogDetail',
    component: () => import('../views/blog/BlogDetail.vue')
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
    path: '/news/editor',
    name: 'NewsEditor',
    component: () => import('../views/news/editor.vue'),
    meta: {
      requiresAuth: true,
      fullscreen: true,
      adminOnly: true // 仅管理员可访问
    }
  },
  {
    path: '/activity/editor',
    name: 'ActivityEditor',
    component: () => import('../views/activity/editor.vue'),
    meta: {
      requiresAuth: true,
      fullscreen: true,
      adminOnly: true // 仅管理员可访问
    }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('../views/activity/Activities.vue')
  },
  {
    path: '/activity/detail',
    name: 'ActivityDetail',
    component: () => import('../views/activity/ActivityDetail.vue')
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('../views/member/Members.vue')
  },
  {
    path: '/moments',
    name: 'Moments',
    component: () => import('../views/moment/Moments.vue')
  },
  {
    path: '/publish-moment',
    name: 'PublishMoment',
    component: () => import('../views/moment/PublishMoment.vue')
  },
  {
    path: '/resources',
    name: 'Resources',
    component: () => import('../views/resources/Resources.vue') // 暂时使用News组件，后续可以创建专门的Resources组件
  },
  {
    path: '/join',
    name: 'Join',
    component: () => import('../views/join/Join.vue')
  },
  {
    path: '/join/application-status',
    name: 'JoinApplicationStatus',
    component: () => import('../views/join/JoinApplicationStatus.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/auth/ForgotPassword.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/user/Profile.vue')
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('../views/practice/Practice.vue')
  },
  {
    path: '/practice/problem/:id',
    name: 'ProblemDetail',
    component: () => import('../views/practice/ProblemDetail.vue'),
    props: true
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/about/About.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/history/History.vue')
  },
  {
    path: '/team',
    name: 'Team',
    component: () => import('../views/team/Team.vue')
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/projects/Projects.vue')
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('../views/gallery/Gallery.vue')
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('../views/faq/FAQ.vue')
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('../views/feedback/Feedback.vue')
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('../views/forum/Forum.vue')
  },
  // 捕获所有未匹配的路由，导向通用建设中页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/common/UnderConstruction.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局导航守卫
router.beforeEach((to, _from, next) => {
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
    
    // 检查是否需要管理员权限
    if (to.meta.adminOnly) {
      // 从localStorage获取用户信息
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          // 假设roleId=1是管理员权限
          if (user.roleId !== 1) {
            // 非管理员，重定向到首页
            console.warn('用户尝试访问仅管理员可访问的页面:', to.path);
            next({ name: 'Home' });
            return;
          }
        } catch (e) {
          console.error('解析用户信息失败:', e);
          next({ name: 'Home' });
          return;
        }
      } else {
        // 没有用户信息，重定向到首页
        console.warn('尝试访问仅管理员可访问的页面，但找不到用户信息');
        next({ name: 'Home' });
        return;
      }
    }
  }
  
  next();
})

export default router