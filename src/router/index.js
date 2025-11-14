import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      meta: {
        require_token: false
      },
      component: () => import('@/pages/login.vue')
    },
    // 首页板块
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
        },
        {
          path: '/equipment_detail',
          name: 'equipment_detail',
          component: () => import('@/pages/order/equipment_detail.vue'),
        },
        {
          path: '/appoint_order',
          name: 'appoint_order',
          component: () => import('@/pages/order/appoint_order.vue'),
        }
      ]
    },
    // 用户板块
    {
      path: '/user',
      redirect: '/user/account_manage/user_space',
      name: 'user',
      meta: {
        require_token: true
      },
      component: () => import('@/pages/user/index.vue'),
      children: [
        {
          path: 'account_manage/user_space',
          name: 'user_space',
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/account_manage/user_space.vue'),
        },
        {
          path: 'invoice_manage/title_manage',
          name: 'title_manage',
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/invoice_manage/title_manage.vue'),
        },
        {
          path: 'invoice_manage/invoice_list',
          name: 'invoice_list',
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/invoice_manage/invoice_list.vue'),
        },
      ]
    },
  ],
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const app = document.getElementById("app")
  app.scrollTo({ top: 0 })
  window.scrollTo(0, 0)
  const token = getToken()
  if(!token && to.meta.require_token) {
    next('/login')
    return
  }
  next()
})


export default router
