<template>
  <div class="flex h-screen overflow-hidden bg-bg-primary">
    <!-- 侧边栏 - 桌面端 -->
    <aside
      class="mobile-hidden w-64 bg-bg-secondary border-r border-border flex-shrink-0 transition-all duration-base"
      :class="{ 'hidden': !sidebarOpen }"
    >
      <div class="h-full flex flex-col">
        <!-- Logo -->
        <div class="p-lg border-b border-border">
          <h1 class="text-xl font-bold text-primary">任务管理系统</h1>
          <p class="text-xs text-text-secondary mt-1">Research Task Manager</p>
        </div>

        <!-- 导航菜单 -->
        <nav class="flex-1 p-md overflow-y-auto">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-md mb-2 transition-all duration-base"
            :class="isActive(item.path) ? 'bg-primary text-white' : 'text-text-primary hover:bg-bg-hover'"
          >
            <span class="text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.name }}</span>
          </router-link>
        </nav>

        <!-- 底部信息 -->
        <div class="p-md border-t border-border">
          <div class="text-xs text-text-muted">
            <p>今日任务: {{ todayTaskCount }}</p>
            <p>完成率: {{ completionRate }}%</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- 移动端侧边栏 -->
    <div
      v-if="mobileSidebarOpen"
      class="desktop-hidden fixed inset-0 z-50 bg-black/50"
      @click="mobileSidebarOpen = false"
    >
      <aside
        class="w-64 h-full bg-bg-secondary"
        @click.stop
      >
        <div class="h-full flex flex-col">
          <!-- Logo -->
          <div class="p-lg border-b border-border flex items-center justify-between">
            <div>
              <h1 class="text-xl font-bold text-primary">任务管理</h1>
              <p class="text-xs text-text-secondary mt-1">Task Manager</p>
            </div>
            <button
              @click="mobileSidebarOpen = false"
              class="p-2 hover:bg-bg-hover rounded-md"
            >
              ✕
            </button>
          </div>

          <!-- 导航菜单 -->
          <nav class="flex-1 p-md overflow-y-auto">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              @click="mobileSidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-md mb-2"
              :class="isActive(item.path) ? 'bg-primary text-white' : 'text-text-primary hover:bg-bg-hover'"
            >
              <span class="text-lg">{{ item.icon }}</span>
              <span class="font-medium">{{ item.name }}</span>
            </router-link>
          </nav>
        </div>
      </aside>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部栏 -->
      <header class="bg-bg-secondary border-b border-border px-md py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            @click="mobileSidebarOpen = true"
            class="desktop-hidden p-2 hover:bg-bg-hover rounded-md"
          >
            ☰
          </button>
          <h2 class="text-lg font-semibold text-text-primary">{{ currentPageTitle }}</h2>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm text-text-secondary">{{ currentDate }}</span>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 overflow-y-auto p-md md:p-lg">
        <router-view />
      </main>
    </div>

    <!-- 移动端底部导航 -->
    <nav class="desktop-hidden fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border">
      <div class="flex justify-around items-center h-16">
        <router-link
          v-for="item in bottomMenuItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center gap-1 px-4 py-2"
          :class="isActive(item.path) ? 'text-primary' : 'text-text-secondary'"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <span class="text-xs">{{ item.name }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import dayjs from 'dayjs'

const route = useRoute()
const taskStore = useTaskStore()

const sidebarOpen = ref(true)
const mobileSidebarOpen = ref(false)

const menuItems = [
  { name: '仪表盘', path: '/dashboard', icon: '📊' },
  { name: '任务管理', path: '/tasks', icon: '✅' },
  { name: '学习记录', path: '/learning', icon: '📚' },
  { name: '论文阅读', path: '/papers', icon: '📄' },
  { name: '实验计划', path: '/experiments', icon: '🔬' },
  { name: '周报生成', path: '/reports', icon: '📝' }
]

const bottomMenuItems = [
  { name: '首页', path: '/dashboard', icon: '📊' },
  { name: '任务', path: '/tasks', icon: '✅' },
  { name: '学习', path: '/learning', icon: '📚' },
  { name: '更多', path: '/papers', icon: '⋯' }
]

const currentDate = computed(() => dayjs().format('YYYY年MM月DD日'))

const currentPageTitle = computed(() => {
  const item = menuItems.find(item => item.path === route.path)
  return item ? item.name : '任务管理系统'
})

const todayTaskCount = computed(() => taskStore.todayTasks.length)

const completionRate = computed(() => {
  const completed = taskStore.tasks.filter(t => t.status === 'completed').length
  const total = taskStore.tasks.length
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const isActive = (path) => {
  return route.path === path
}
</script>
