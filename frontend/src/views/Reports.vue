<template>
  <div class="space-y-md">
    <!-- 工具栏 -->
    <div class="card">
      <div class="flex flex-col md:flex-row gap-3 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-text-primary mb-1">选择周期</label>
          <div class="flex gap-2">
            <input v-model="dateRange.start" type="date" class="input" />
            <span class="flex items-center">-</span>
            <input v-model="dateRange.end" type="date" class="input" />
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="setCurrentWeek" class="btn-secondary">
            本周
          </button>
          <button @click="setLastWeek" class="btn-secondary">
            上周
          </button>
          <button @click="generateReport" class="btn-primary">
            生成周报
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="card text-center py-16">
      <div class="text-4xl mb-4">⏳</div>
      <p class="text-text-secondary">正在生成周报...</p>
    </div>

    <!-- 周报内容 -->
    <div v-else-if="report" class="space-y-md">
      <!-- 概览 -->
      <div class="card">
        <h2 class="text-2xl font-bold text-text-primary mb-md">
          周报概览
        </h2>
        <p class="text-text-secondary mb-lg">
          {{ formatDate(report.period.start_date) }} - {{ formatDate(report.period.end_date) }}
        </p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div class="text-center p-4 bg-bg-hover rounded-md">
            <p class="text-text-secondary text-sm">任务总数</p>
            <p class="text-3xl font-bold text-primary mt-2">
              {{ report.summary.tasks.total }}
            </p>
          </div>

          <div class="text-center p-4 bg-bg-hover rounded-md">
            <p class="text-text-secondary text-sm">已完成</p>
            <p class="text-3xl font-bold text-success mt-2">
              {{ report.summary.tasks.completed }}
            </p>
          </div>

          <div class="text-center p-4 bg-bg-hover rounded-md">
            <p class="text-text-secondary text-sm">学习时长</p>
            <p class="text-3xl font-bold text-info mt-2">
              {{ report.summary.learning.total_hours || 0 }}h
            </p>
          </div>

          <div class="text-center p-4 bg-bg-hover rounded-md">
            <p class="text-text-secondary text-sm">完成率</p>
            <p class="text-3xl font-bold text-warning mt-2">
              {{ report.summary.tasks.completion_rate }}%
            </p>
          </div>
        </div>
      </div>

      <!-- 已完成任务 -->
      <div class="card">
        <h3 class="text-xl font-semibold mb-md flex items-center gap-2">
          <span>✅</span>
          <span>已完成任务 ({{ report.details.completed_tasks.length }})</span>
        </h3>

        <div v-if="report.details.completed_tasks.length === 0" class="text-center py-8 text-text-muted">
          本周暂无完成的任务
        </div>

        <div v-else class="space-y-2">
          <!-- 按分类分组显示 -->
          <div v-for="category in ['research', 'course', 'life']" :key="category">
            <div v-if="getTasksByCategory(report.details.completed_tasks, category).length > 0">
              <h4 class="font-medium text-text-primary mb-2 flex items-center gap-2">
                <span :class="`badge-${category}`">{{ categoryMap[category] }}</span>
                <span class="text-sm text-text-muted">
                  ({{ getTasksByCategory(report.details.completed_tasks, category).length }})
                </span>
              </h4>

              <ul class="space-y-1 ml-4 mb-4">
                <li
                  v-for="task in getTasksByCategory(report.details.completed_tasks, category)"
                  :key="task.id"
                  class="text-sm text-text-secondary flex items-start gap-2"
                >
                  <span class="text-success mt-1">●</span>
                  <span class="flex-1">{{ task.title }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 未完成任务 -->
      <div v-if="report.details.pending_tasks.length > 0" class="card border-l-4 border-warning">
        <h3 class="text-xl font-semibold mb-md flex items-center gap-2">
          <span>⏳</span>
          <span>未完成任务 ({{ report.details.pending_tasks.length }})</span>
        </h3>

        <ul class="space-y-2">
          <li
            v-for="task in report.details.pending_tasks"
            :key="task.id"
            class="flex items-start justify-between p-3 bg-yellow-50 rounded-md"
          >
            <span class="text-text-primary">{{ task.title }}</span>
            <span :class="`badge-${task.priority}`">{{ priorityMap[task.priority] }}</span>
          </li>
        </ul>
      </div>

      <!-- 学习记录 -->
      <div v-if="report.details.learning_records.length > 0" class="card">
        <h3 class="text-xl font-semibold mb-md flex items-center gap-2">
          <span>📚</span>
          <span>学习记录</span>
        </h3>

        <div class="space-y-3">
          <div
            v-for="record in report.details.learning_records"
            :key="record.id"
            class="p-3 bg-bg-hover rounded-md"
          >
            <div class="flex items-start justify-between mb-2">
              <h4 class="font-medium text-text-primary">{{ record.subject }}</h4>
              <span class="badge bg-info/10 text-info">{{ record.hours }}h</span>
            </div>
            <p v-if="record.content" class="text-sm text-text-secondary">
              {{ record.content }}
            </p>
          </div>
        </div>

        <div class="mt-4 p-3 bg-info/10 rounded-md">
          <p class="text-sm font-medium text-info">
            本周共学习 {{ report.summary.learning.total_hours || 0 }} 小时，
            涉及 {{ report.summary.learning.subjects_count || 0 }} 个科目
          </p>
        </div>
      </div>

      <!-- 论文阅读 -->
      <div v-if="report.details.papers.length > 0" class="card">
        <h3 class="text-xl font-semibold mb-md flex items-center gap-2">
          <span>📄</span>
          <span>论文阅读 ({{ report.details.papers.length }})</span>
        </h3>

        <ul class="space-y-2">
          <li
            v-for="paper in report.details.papers"
            :key="paper.id"
            class="p-3 bg-bg-hover rounded-md"
          >
            <h4 class="font-medium text-text-primary mb-1">{{ paper.title }}</h4>
            <p v-if="paper.authors" class="text-sm text-text-secondary">
              {{ paper.authors }}
            </p>
          </li>
        </ul>
      </div>

      <!-- 实验计划 -->
      <div v-if="report.details.experiments.length > 0" class="card">
        <h3 class="text-xl font-semibold mb-md flex items-center gap-2">
          <span>🔬</span>
          <span>实验计划 ({{ report.details.experiments.length }})</span>
        </h3>

        <div class="space-y-3">
          <div
            v-for="exp in report.details.experiments"
            :key="exp.id"
            class="p-3 bg-bg-hover rounded-md"
          >
            <div class="flex items-start justify-between mb-2">
              <h4 class="font-medium text-text-primary">{{ exp.title }}</h4>
              <span :class="`badge ${getExpStatusClass(exp.status)}`">
                {{ expStatusMap[exp.status] }}
              </span>
            </div>
            <p v-if="exp.objective" class="text-sm text-text-secondary">
              {{ exp.objective }}
            </p>
          </div>
        </div>
      </div>

      <!-- 导出按钮 -->
      <div class="card flex justify-end gap-3">
        <button @click="exportAsText" class="btn-secondary">
          导出文本
        </button>
        <button @click="copyToClipboard" class="btn-primary">
          复制到剪贴板
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="card text-center py-16 text-text-muted">
      <div class="text-6xl mb-4">📝</div>
      <p class="text-lg">选择日期范围并点击"生成周报"</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reportAPI } from '@/api'
import dayjs from 'dayjs'

const loading = ref(false)
const report = ref(null)
const dateRange = ref({
  start: '',
  end: ''
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

const expStatusMap = {
  planned: '已计划',
  ongoing: '进行中',
  completed: '已完成',
  failed: '失败'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

const setCurrentWeek = async () => {
  const weekData = await reportAPI.getCurrentWeek()
  dateRange.value = weekData
}

const setLastWeek = async () => {
  const today = dayjs()
  const lastMonday = today.subtract(1, 'week').startOf('week').add(1, 'day')
  const lastSunday = lastMonday.add(6, 'day')

  dateRange.value = {
    start: lastMonday.format('YYYY-MM-DD'),
    end: lastSunday.format('YYYY-MM-DD')
  }
}

const generateReport = async () => {
  if (!dateRange.value.start || !dateRange.value.end) {
    alert('请选择日期范围')
    return
  }

  loading.value = true
  try {
    report.value = await reportAPI.generate(dateRange.value)
  } catch (error) {
    alert('生成周报失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const getTasksByCategory = (tasks, category) => {
  return tasks.filter(t => t.category === category)
}

const getExpStatusClass = (status) => {
  const map = {
    planned: 'bg-gray-100 text-gray-800',
    ongoing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }
  return map[status] || ''
}

const exportAsText = () => {
  if (!report.value) return

  let text = `# 周报 (${formatDate(report.value.period.start_date)} - ${formatDate(report.value.period.end_date)})\n\n`

  text += `## 概览\n`
  text += `- 任务总数: ${report.value.summary.tasks.total}\n`
  text += `- 已完成: ${report.value.summary.tasks.completed}\n`
  text += `- 完成率: ${report.value.summary.tasks.completion_rate}%\n`
  text += `- 学习时长: ${report.value.summary.learning.total_hours || 0}小时\n\n`

  text += `## 已完成任务\n`
  for (const category of ['research', 'course', 'life']) {
    const tasks = getTasksByCategory(report.value.details.completed_tasks, category)
    if (tasks.length > 0) {
      text += `\n### ${categoryMap[category]}\n`
      tasks.forEach(task => {
        text += `- ${task.title}\n`
      })
    }
  }

  if (report.value.details.learning_records.length > 0) {
    text += `\n## 学习记录\n`
    report.value.details.learning_records.forEach(record => {
      text += `- ${record.subject} (${record.hours}小时)\n`
    })
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `周报_${dateRange.value.start}_${dateRange.value.end}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const copyToClipboard = async () => {
  if (!report.value) return

  // 生成文本内容（同上）
  let text = `# 周报 (${formatDate(report.value.period.start_date)} - ${formatDate(report.value.period.end_date)})\n\n`
  // ... (同 exportAsText 的逻辑)

  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (error) {
    alert('复制失败')
  }
}

onMounted(async () => {
  await setCurrentWeek()
})
</script>
