import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
          path: 'home_page',
          name: 'home_page',
          meta: {
            require_token: false
          },
          component: () => import('@/pages/home_page.vue'),
        },
        {
          path: 'equipment_detail',
          name: 'equipment_detail',//设备详情
          meta: {
            require_token: false
          },
          component: () => import('@/pages/order/equipment_detail.vue'),
        },
        {
          path: 'appoint_order',
          name: 'appoint_order',//下单页
          meta: {
            require_token: true
          },
          component: () => import('@/pages/order/appoint_order.vue'),
        },
        {
          path: 'service_order',
          name: 'service_order',//订单附加服务费用页
          meta: {
            require_token: true
          },
          component: () => import('@/pages/order/service_order.vue'),
        },
        {
          path: 'pay_order',
          name: 'pay_order',//订单支付页面
          meta: {
            require_token: true
          },
          component: () => import('@/pages/order/pay_order.vue'),
        },
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
          name: 'user_space',//个人中心
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/account_manage/user_space.vue'),
        },
        {
          path: 'account_manage/identity_authentication',
          name: 'identity_authentication',//身份认证
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/account_manage/identity_authentication.vue'),
        },
        {
          path: 'account_manage/edit_user_info',
          name: 'edit_user_info',//编辑个人信息
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/account_manage/edit_user_info.vue'),
        },
        {
          path: 'account_manage/invite_friend',
          name: 'invite_friend',//邀请好友活动板块
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/account_manage/invite_friend.vue'),
        },
        {
          path: 'account_manage/integral_mall',
          name: 'integral_mall',//积分商城活动板块
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/account_manage/integral_mall.vue'),
        },
        {
          path: 'account_manage/cooperative_settlement',
          name: 'cooperative_settlement',//订单支付页面
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/account_manage/cooperative_settlement.vue'),
        },
        {
          path: 'order_manage/user_order_list',
          name: 'user_order_list',//个人订单
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/order_manage/user_order_list.vue'),
        },
        {
          path: 'order_manage/user_order_operate',
          name: 'user_order_operate',//个人订单操作
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/order_manage/user_order_operate.vue'),
        },
        {
          path: 'invoice_manage/title_manage',
          name: 'title_manage',//抬头管理
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/invoice_manage/title_manage.vue'),
        },
        {
          path: 'invoice_manage/invoice_list',
          name: 'invoice_list',//我的发票
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/invoice_manage/invoice_list.vue'),
        },
      ]
    },
    //登录页
    {
      path: '/login',
      name: 'login',
      meta: {
        require_token: false
      },
      component: () => import('@/pages/login.vue')
    },
    // 404 路由配置 - 必须放在最后！
    {
      path: '/:pathMatch(.*)*', // 匹配所有路径
      name: 'NotFound',
      component: () => import('@/pages/error/404.vue'), // 直接渲染 NotFound 组件
      // 或者，你也可以重定向到一个专门的 /404 路径
      // redirect: '/404' 
      // 这种情况下，你需要另外定义一个 path: '/404' 的路由
    }
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
