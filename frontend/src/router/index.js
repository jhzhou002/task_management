import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: '/tasks',
        name: 'Tasks',
        component: () => import('@/views/Tasks.vue')
      },
      {
        path: '/learning',
        name: 'Learning',
        component: () => import('@/views/Learning.vue')
      },
      {
        path: '/papers',
        name: 'Papers',
        component: () => import('@/views/Papers.vue')
      },
      {
        path: '/experiments',
        name: 'Experiments',
        component: () => import('@/views/Experiments.vue')
      },
      {
        path: '/reports',
        name: 'Reports',
        component: () => import('@/views/Reports.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
