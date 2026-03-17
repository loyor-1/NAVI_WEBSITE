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
          path: 'equipment_mall_detail',
          name: 'equipment_mall_detail',//仪器采购---设备详情
          meta: {
            require_token: false
          },
          component: () => import('@/pages/order/equipment_mall_detail.vue'),
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
          name: 'pay_order',//订单支付
          meta: {
            require_token: true
          },
          component: () => import('@/pages/order/pay_order.vue'),
        },
        {
          path: 'search_page',
          name: 'search_page',//搜索设备
          meta: {
            require_token: false,
          },
          component: () => import('@/pages/tab/search_page.vue'),
        },
        {
          path: 'cloud_scene',
          name: 'cloud_scene',//tab---云现场
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/cloud_scene.vue'),
        },
        {
          path: 'material_test',
          name: 'material_test',//tab---材料检测
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/material_test.vue'),
        },
        {
          path: 'high_test',
          name: 'high_test',//tab---高端测试
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/high_test.vue'),
        },
        {
          path: 'bio_detection',
          name: 'bio_detection',//tab---生物检测
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/bio_detection.vue'),
        },
        {
          path: 'equipment_mall',
          name: 'equipment_mall',//tab---仪器采购
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/equipment_mall.vue'),
        },
        {
          path: 'material_processing',
          name: 'material_processing',//tab---材料加工
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/material_processing.vue'),
        },
        {
          path: 'life_sciences',
          name: 'life_sciences',//tab---试剂耗材
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/life_sciences.vue'),
        },
        {
          path: 'environment_detection',
          name: 'environment_detection',//tab---环境检测
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/environment_detection.vue'),
        },
        {
          path: 'analog_computation',
          name: 'analog_computation',//tab---模拟计算
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/analog_computation.vue'),
        },
        {
          path: 'scientific_draw',
          name: 'scientific_draw',//tab---科研绘图
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/scientific_draw.vue'),
        },
        {
          path: 'thesis_services',
          name: 'thesis_services',//tab---论文润色
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/thesis_services.vue'),
        },
        {
          path: 'data_analysis',
          name: 'data_analysis',//tab---数据分析
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/data_analysis.vue'),
        },
        {
          path: 'about_us',
          name: 'about_us',//tab---关于我们
          meta: {
            require_token: true
          },
          component: () => import('@/pages/tab/about_us.vue'),
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
          name: 'cooperative_settlement',//合作入驻板块
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/account_manage/cooperative_settlement.vue'),
        },
        
        {
          path: 'account_manage/patent_services',
          name: 'patent_services',//专利服务板块
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/account_manage/patent_services.vue'),
        },
        {
          path: 'order_manage/user_order_list',
          name: 'user_order_list',//个人订单
          meta: {
            require_token: true,
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
          path: 'order_manage/order_drafts',
          name: 'order_drafts',//草稿箱
          meta: {
            require_token: true
          },
          component: () => import('@/pages/user/order_manage/order_drafts.vue'),
        },
        {
          path: 'team_manage/team_space',
          name: 'team_space',//我的团队
          meta: {
            require_token: true,
            keep_alive: true,
          },
          component: () => import('@/pages/user/team_manage/team_space.vue'),
        },
        {
          path: 'team_manage/team_financial_center',
          name: 'team_financial_center',//团队财务中心
          meta: {
            require_token: true,
          },
          component: () => import('@/pages/user/team_manage/team_financial_center.vue'),
        },
        {
          path: 'team_manage/team_order_list',
          name: 'team_order_list',//团队订单
          meta: {
            require_token: true,
          },
          component: () => import('@/pages/user/team_manage/team_order_list.vue'),
        },
        {
          path: 'team_manage/team_order_operate',
          name: 'team_order_operate',//团队订单操作
          meta: {
            require_token: true,
          },
          component: () => import('@/pages/user/team_manage/team_order_operate.vue'),
        },
        {
          path: 'team_manage/team_invoice',
          name: 'team_invoice',//团队发票
          meta: {
            require_token: true,
          },
          component: () => import('@/pages/user/team_manage/team_invoice.vue'),
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
