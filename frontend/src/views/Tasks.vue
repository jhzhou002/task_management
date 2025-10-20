<template>
  <div class="space-y-md">
    <!-- 工具栏 -->
    <div class="card">
      <div class="flex flex-col md:flex-row gap-3">
        <!-- 搜索框 -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索任务..."
          class="input flex-1"
          @input="handleSearch"
        />

        <!-- 筛选器 -->
        <select v-model="filterCategory" class="select" @change="applyFilters">
          <option value="">全部分类</option>
          <option value="research">科研</option>
          <option value="course">课程</option>
          <option value="life">生活</option>
        </select>

        <select v-model="filterStatus" class="select" @change="applyFilters">
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
        </select>

        <!-- 添加任务按钮 -->
        <button @click="showAddModal = true" class="btn-primary whitespace-nowrap">
          ➕ 新建任务
        </button>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="editTask(task)"
      >
        <!-- 任务头部 -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-start gap-2 flex-1">
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              @click.stop
              @change="toggleStatus(task)"
              class="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div class="flex-1">
              <h3
                class="font-semibold text-text-primary mb-1"
                :class="task.status === 'completed' ? 'line-through text-text-muted' : ''"
              >
                {{ task.title }}
              </h3>
              <p
                v-if="task.description"
                class="text-sm text-text-secondary line-clamp-2"
              >
                {{ task.description }}
              </p>
            </div>
          </div>

          <!-- 优先级标识 -->
          <span :class="`badge-${task.priority}`">
            {{ priorityMap[task.priority] }}
          </span>
        </div>

        <!-- 任务信息 -->
        <div class="flex items-center justify-between text-sm">
          <span :class="`badge-${task.category}`">
            {{ categoryMap[task.category] }}
          </span>

          <div class="flex items-center gap-2">
            <span :class="`badge-${task.status}`">
              {{ statusMap[task.status] }}
            </span>

            <span
              v-if="task.due_date"
              class="text-text-secondary"
              :class="{ 'text-danger font-semibold': isOverdue(task) }"
            >
              {{ formatDate(task.due_date) }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2 mt-3 pt-3 border-t border-border">
          <button
            @click.stop="editTask(task)"
            class="btn-sm btn-secondary flex-1"
          >
            编辑
          </button>
          <button
            @click.stop="deleteTask(task.id)"
            class="btn-sm btn-danger"
          >
            删除
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="filteredTasks.length === 0"
        class="col-span-full text-center py-16 text-text-muted"
      >
        <div class="text-6xl mb-4">📝</div>
        <p class="text-lg">暂无任务</p>
        <button @click="showAddModal = true" class="btn-primary mt-4">
          创建第一个任务
        </button>
      </div>
    </div>

    <!-- 添加/编辑任务模态框 -->
    <div
      v-if="showAddModal || showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-bg-secondary rounded-lg shadow-lg max-w-md w-full p-lg">
        <h2 class="text-xl font-bold mb-md">
          {{ showEditModal ? '编辑任务' : '新建任务' }}
        </h2>

        <form @submit.prevent="saveTask" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              任务标题 <span class="text-danger">*</span>
            </label>
            <input
              v-model="taskForm.title"
              type="text"
              required
              class="input"
              placeholder="输入任务标题"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              任务描述
            </label>
            <textarea
              v-model="taskForm.description"
              rows="3"
              class="textarea"
              placeholder="输入任务描述（可选）"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                分类
              </label>
              <select v-model="taskForm.category" class="select">
                <option value="research">科研</option>
                <option value="course">课程</option>
                <option value="life">生活</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                优先级
              </label>
              <select v-model="taskForm.priority" class="select">
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                状态
              </label>
              <select v-model="taskForm.status" class="select">
                <option value="pending">待处理</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                截止日期
              </label>
              <input
                v-model="taskForm.due_date"
                type="date"
                class="input"
              />
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeModal" class="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" class="btn-primary flex-1">
              {{ showEditModal ? '保存' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import dayjs from 'dayjs'

const taskStore = useTaskStore()

const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)

const taskForm = ref({
  id: null,
  title: '',
  description: '',
  category: 'research',
  status: 'pending',
  priority: 'medium',
  due_date: ''
})

const categoryMap = {
  research: '科研',
  course: '课程',
  life: '生活'
}

const statusMap = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成'
}

const priorityMap = {
  low: '低',
  medium: '中',
  high: '高'
}

const filteredTasks = computed(() => {
  return taskStore.tasks
})

const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}

const isOverdue = (task) => {
  return task.status !== 'completed' &&
    task.due_date &&
    dayjs(task.due_date).isBefore(dayjs(), 'day')
}

const handleSearch = () => {
  taskStore.setFilter({ search: searchQuery.value })
  taskStore.fetchTasks()
}

const applyFilters = () => {
  taskStore.setFilter({
    category: filterCategory.value,
    status: filterStatus.value
  })
  taskStore.fetchTasks()
}

const toggleStatus = async (task) => {
  const newStatus = task.status === 'completed' ? 'pending' : 'completed'
  await taskStore.updateTaskStatus(task.id, newStatus)
}

const editTask = (task) => {
  taskForm.value = {
    id: task.id,
    title: task.title,
    description: task.description || '',
    category: task.category,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date ? dayjs(task.due_date).format('YYYY-MM-DD') : ''
  }
  showEditModal.value = true
}

const deleteTask = async (id) => {
  if (confirm('确定要删除这个任务吗?')) {
    await taskStore.deleteTask(id)
  }
}

const saveTask = async () => {
  try {
    if (showEditModal.value) {
      await taskStore.updateTask(taskForm.value.id, taskForm.value)
    } else {
      await taskStore.createTask(taskForm.value)
    }
    closeModal()
  } catch (error) {
    alert('保存失败: ' + error.message)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  taskForm.value = {
    id: null,
    title: '',
    description: '',
    category: 'research',
    status: 'pending',
    priority: 'medium',
    due_date: ''
  }
}

onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
