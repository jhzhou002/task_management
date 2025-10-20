<template>
  <div class="space-y-md">
    <!-- 工具栏 -->
    <div class="card">
      <div class="flex flex-col md:flex-row gap-3 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-text-primary mb-1">日期范围</label>
          <div class="flex gap-2">
            <input v-model="dateRange.start" type="date" class="input" />
            <span class="flex items-center">-</span>
            <input v-model="dateRange.end" type="date" class="input" />
          </div>
        </div>

        <button @click="showAddModal = true" class="btn-primary whitespace-nowrap">
          ➕ 记录学习
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
      <div class="card">
        <p class="text-text-secondary text-sm">总学习时长</p>
        <p class="text-3xl font-bold text-primary mt-2">{{ totalHours }}h</p>
      </div>

      <div class="card">
        <p class="text-text-secondary text-sm">学习科目数</p>
        <p class="text-3xl font-bold text-success mt-2">{{ subjectCount }}</p>
      </div>

      <div class="card">
        <p class="text-text-secondary text-sm">平均每日</p>
        <p class="text-3xl font-bold text-info mt-2">{{ avgHoursPerDay }}h</p>
      </div>
    </div>

    <!-- 学习记录列表 -->
    <div class="card">
      <h3 class="text-lg font-semibold mb-md">学习记录</h3>

      <div v-if="records.length === 0" class="text-center py-16 text-text-muted">
        <div class="text-6xl mb-4">📚</div>
        <p class="text-lg">暂无学习记录</p>
        <button @click="showAddModal = true" class="btn-primary mt-4">
          添加第一条记录
        </button>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="record in records"
          :key="record.id"
          class="p-4 bg-bg-hover rounded-md hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <h4 class="font-semibold text-text-primary">{{ record.subject }}</h4>
              <p v-if="record.content" class="text-sm text-text-secondary mt-1">
                {{ record.content }}
              </p>
            </div>
            <span class="badge bg-primary/10 text-primary font-semibold">
              {{ record.hours }}小时
            </span>
          </div>

          <div v-if="record.notes" class="text-sm text-text-secondary bg-white p-3 rounded mb-2">
            {{ record.notes }}
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-text-muted">{{ formatDate(record.date) }}</span>
            <div class="flex gap-2">
              <button @click="editRecord(record)" class="text-primary hover:underline">
                编辑
              </button>
              <button @click="deleteRecord(record.id)" class="text-danger hover:underline">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑模态框 -->
    <div
      v-if="showAddModal || showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-bg-secondary rounded-lg shadow-lg max-w-md w-full p-lg">
        <h2 class="text-xl font-bold mb-md">
          {{ showEditModal ? '编辑学习记录' : '添加学习记录' }}
        </h2>

        <form @submit.prevent="saveRecord" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              学习科目 <span class="text-danger">*</span>
            </label>
            <input
              v-model="recordForm.subject"
              type="text"
              required
              class="input"
              placeholder="如：深度学习、算法分析"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              学习内容
            </label>
            <textarea
              v-model="recordForm.content"
              rows="3"
              class="textarea"
              placeholder="简述学习的内容"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                学习时长 <span class="text-danger">*</span>
              </label>
              <input
                v-model.number="recordForm.hours"
                type="number"
                step="0.5"
                min="0"
                required
                class="input"
                placeholder="2.5"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                日期
              </label>
              <input
                v-model="recordForm.date"
                type="date"
                class="input"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              学习笔记
            </label>
            <textarea
              v-model="recordForm.notes"
              rows="4"
              class="textarea"
              placeholder="记录学习心得、重点内容等"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeModal" class="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" class="btn-primary flex-1">
              {{ showEditModal ? '保存' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { learningAPI } from '@/api'
import dayjs from 'dayjs'

const records = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)

const dateRange = ref({
  start: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  end: dayjs().format('YYYY-MM-DD')
})

const recordForm = ref({
  id: null,
  subject: '',
  content: '',
  hours: 0,
  notes: '',
  date: dayjs().format('YYYY-MM-DD')
})

const totalHours = computed(() => {
  return records.value.reduce((sum, r) => sum + parseFloat(r.hours || 0), 0).toFixed(1)
})

const subjectCount = computed(() => {
  const subjects = new Set(records.value.map(r => r.subject))
  return subjects.size
})

const avgHoursPerDay = computed(() => {
  if (records.value.length === 0) return 0
  const days = dayjs(dateRange.value.end).diff(dayjs(dateRange.value.start), 'day') + 1
  return (totalHours.value / days).toFixed(1)
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const fetchRecords = async () => {
  try {
    records.value = await learningAPI.getAll({
      start_date: dateRange.value.start,
      end_date: dateRange.value.end
    })
  } catch (error) {
    console.error('获取学习记录失败:', error)
  }
}

const editRecord = (record) => {
  recordForm.value = {
    id: record.id,
    subject: record.subject,
    content: record.content || '',
    hours: record.hours,
    notes: record.notes || '',
    date: dayjs(record.date).format('YYYY-MM-DD')
  }
  showEditModal.value = true
}

const deleteRecord = async (id) => {
  if (confirm('确定要删除这条记录吗?')) {
    try {
      await learningAPI.delete(id)
      await fetchRecords()
    } catch (error) {
      alert('删除失败: ' + error.message)
    }
  }
}

const saveRecord = async () => {
  try {
    if (showEditModal.value) {
      await learningAPI.update(recordForm.value.id, recordForm.value)
    } else {
      await learningAPI.create(recordForm.value)
    }
    await fetchRecords()
    closeModal()
  } catch (error) {
    alert('保存失败: ' + error.message)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  recordForm.value = {
    id: null,
    subject: '',
    content: '',
    hours: 0,
    notes: '',
    date: dayjs().format('YYYY-MM-DD')
  }
}

onMounted(() => {
  fetchRecords()
})
</script>
