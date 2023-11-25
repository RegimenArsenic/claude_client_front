import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 无需权限验证的页面
    {
      path: '/',
      name: 'index',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    // 需要权限验证的页面
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/PageView.vue'),
      meta: { requiresAuth: true }
    },
  ]
})

export default router
