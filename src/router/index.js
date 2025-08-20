import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home_page',
      name: 'home',
      meta: {
        require_token: false
      },
      component: () => import('@/pages/index.vue'),
      children: [
        {
          path: '/home_page',
          name: 'home_page',
          meta: {
            require_token: false
          },
          component: () => import('@/pages/home_page.vue'),
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        require_token: false
      },
      component: () => import('@/pages/login.vue')
    },
  ],
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = getToken()
  if(!token && to.meta.require_token) {
    next('/login')
    return
  }
  next()
})


export default router
