import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/index.vue'),
      children: [
        {
          path: '/home_page',
          name: 'home_page',
          component: () => import('@/pages/home_page.vue'),
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/login.vue')
    },
  ],
})

export default router
