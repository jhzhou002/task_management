<template>
  <div class="space-y-lg">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-text-secondary text-sm">今日任务</p>
            <p class="text-2xl font-bold text-text-primary mt-1">{{ todayTaskCount }}</p>
          </div>
          <div class="text-3xl">📅</div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-text-secondary text-sm">本周完成</p>
            <p class="text-2xl font-bold text-success mt-1">{{ stats.weekCompleted }}</p>
          </div>
          <div class="text-3xl">✅</div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-text-secondary text-sm">学习时长</p>
            <p class="text-2xl font-bold text-info mt-1">{{ stats.weekHours }}h</p>
          </div>
          <div class="text-3xl">📚</div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-text-secondary text-sm">完成率</p>
            <p class="text-2xl font-bold text-primary mt-1">{{ completionRate }}%</p>
          </div>
          <div class="text-3xl">📊</div>
        </div>
      </div>
    </div>

    <!-- 今日任务 & 即将到期 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-md">
      <!-- 今日任务 -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-md flex items-center justify-between">
          <span>今日任务</span>
          <router-link to="/tasks" class="text-sm text-primary hover:underline">查看全部 →</router-link>
        </h3>

        <div v-if="todayTasks.length === 0" class="text-center py-8 text-text-muted">
          暂无今日任务
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="task in todayTasks.slice(0, 5)"
            :key="task.id"
            class="p-3 bg-bg-hover rounded-md flex items-center justify-between hover:bg-border-light transition-colors"
          >
            <div class="flex items-center gap-2 flex-1">
              <input
                type="checkbox"
                :checked="task.status === 'completed'"
                @change="toggleTaskStatus(task)"
                class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span
                class="flex-1"
                :class="task.status === 'completed' ? 'line-through text-text-muted' : 'text-text-primary'"
              >
                {{ task.title }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span :class="`badge-${task.category}`">{{ categoryMap[task.category] }}</span>
              <span :class="`badge-${task.priority}`">{{ priorityMap[task.priority] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 即将到期 -->
      <div class="card">
        <h3 class="text-lg font-semibold mb-md">即将到期</h3>

        <div v-if="upcomingTasks.length === 0" class="text-center py-8 text-text-muted">
          暂无即将到期的任务
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="task in upcomingTasks.slice(0, 5)"
            :key="task.id"
            class="p-3 bg-bg-hover rounded-md hover:bg-border-light transition-colors"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-text-primary">{{ task.title }}</span>
              <span :class="`badge-${task.priority}`">{{ priorityMap[task.priority] }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span :class="`badge-${task.category}`">{{ categoryMap[task.category] }}</span>
              <span class="text-text-secondary">{{ formatDate(task.due_date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 过期任务提醒 -->
    <div v-if="overdueTasks.length > 0" class="card border-l-4 border-danger">
      <h3 class="text-lg font-semibold mb-md text-danger flex items-center gap-2">
        <span>⚠️</span>
        <span>过期任务 ({{ overdueTasks.length }})</span>
      </h3>

      <div class="space-y-2">
        <div
          v-for="task in overdueTasks.slice(0, 3)"
          :key="task.id"
          class="p-3 bg-red-50 rounded-md flex items-center justify-between"
        >
          <span class="text-text-primary">{{ task.title }}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-text-secondary">
              过期 {{ daysSince(task.due_date) }} 天
            </span>
            <button
              @click="markAsCompleted(task)"
              class="btn-sm btn-success"
            >
              标记完成
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 本周统计图表 -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-md">本周任务分布</h3>

      <div class="grid grid-cols-3 gap-md">
        <div class="text-center p-4 bg-bg-hover rounded-md">
          <p class="text-text-secondary text-sm">科研任务</p>
          <p class="text-2xl font-bold text-blue-500 mt-2">{{ categoryStats.research || 0 }}</p>
        </div>
        <div class="text-center p-4 bg-bg-hover rounded-md">
          <p class="text-text-secondary text-sm">课程任务</p>
          <p class="text-2xl font-bold text-green-500 mt-2">{{ categoryStats.course || 0 }}</p>
        </div>
        <div class="text-center p-4 bg-bg-hover rounded-md">
          <p class="text-text-secondary text-sm">生活事务</p>
          <p class="text-2xl font-bold text-purple-500 mt-2">{{ categoryStats.life || 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import dayjs from 'dayjs'

const taskStore = useTaskStore()

const stats = ref({
  weekCompleted: 0,
  weekHours: 0
})

const categoryMap = {
  research: '科研',
  course: '课程',
  life: '生活'
}

const priorityMap = {
  low: '低',
  medium: '中',
  high: '高'
}

const todayTasks = computed(() => taskStore.todayTasks)
const upcomingTasks = computed(() => taskStore.upcomingTasks)
const overdueTasks = computed(() => taskStore.overdueTasks)
const todayTaskCount = computed(() => todayTasks.value.length)

const completionRate = computed(() => {
  const completed = taskStore.tasks.filter(t => t.status === 'completed').length
  const total = taskStore.tasks.length
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const categoryStats = computed(() => {
  return taskStore.tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1
    return acc
  }, {})
})

const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}

const daysSince = (date) => {
  return dayjs().diff(dayjs(date), 'day')
}

const toggleTaskStatus = async (task) => {
  const newStatus = task.status === 'completed' ? 'pending' : 'completed'
  await taskStore.updateTaskStatus(task.id, newStatus)
}

const markAsCompleted = async (task) => {
  await taskStore.updateTaskStatus(task.id, 'completed')
}

onMounted(async () => {
  await taskStore.fetchTasks()

  // 计算本周统计
  const startOfWeek = dayjs().startOf('week')
  const completedThisWeek = taskStore.tasks.filter(task =>
    task.status === 'completed' &&
    dayjs(task.completed_at).isAfter(startOfWeek)
  )
  stats.value.weekCompleted = completedThisWeek.length
  stats.value.weekHours = Math.floor(Math.random() * 40) + 10 // 示例数据，需要从学习记录获取
})
</script>
