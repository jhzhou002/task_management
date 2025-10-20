<template>
  <div class="space-y-md">
    <!-- 工具栏 -->
    <div class="card flex justify-between items-center">
      <select v-model="filterStatus" class="select" @change="fetchExperiments">
        <option value="">全部状态</option>
        <option value="planned">已计划</option>
        <option value="ongoing">进行中</option>
        <option value="completed">已完成</option>
        <option value="failed">失败</option>
      </select>

      <button @click="showAddModal = true" class="btn-primary">
        ➕ 新建实验
      </button>
    </div>

    <!-- 实验列表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-md">
      <div
        v-for="exp in experiments"
        :key="exp.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <h3 class="font-bold text-lg text-text-primary flex-1">{{ exp.title }}</h3>
          <span :class="`badge ${getStatusBadgeClass(exp.status)}`">
            {{ statusMap[exp.status] }}
          </span>
        </div>

        <div class="space-y-3">
          <div v-if="exp.objective">
            <p class="text-sm font-medium text-text-primary">实验目标:</p>
            <p class="text-sm text-text-secondary mt-1">{{ exp.objective }}</p>
          </div>

          <div v-if="exp.methodology">
            <p class="text-sm font-medium text-text-primary">实验方法:</p>
            <p class="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{{ exp.methodology }}</p>
          </div>

          <div v-if="exp.expected_results">
            <p class="text-sm font-medium text-text-primary">预期结果:</p>
            <p class="text-sm text-text-secondary mt-1">{{ exp.expected_results }}</p>
          </div>

          <div v-if="exp.actual_results" class="bg-success/10 p-3 rounded">
            <p class="text-sm font-medium text-success">实际结果:</p>
            <p class="text-sm text-text-secondary mt-1">{{ exp.actual_results }}</p>
          </div>

          <div class="flex items-center justify-between text-sm pt-3 border-t border-border">
            <div class="text-text-muted">
              <span v-if="exp.start_date">{{ formatDate(exp.start_date) }}</span>
              <span v-if="exp.end_date"> - {{ formatDate(exp.end_date) }}</span>
            </div>

            <div class="flex gap-2">
              <button @click="editExperiment(exp)" class="btn-sm btn-secondary">
                编辑
              </button>
              <button @click="deleteExperiment(exp.id)" class="btn-sm btn-danger">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="experiments.length === 0"
        class="col-span-full card text-center py-16 text-text-muted"
      >
        <div class="text-6xl mb-4">🔬</div>
        <p class="text-lg">暂无实验计划</p>
        <button @click="showAddModal = true" class="btn-primary mt-4">
          创建第一个实验
        </button>
      </div>
    </div>

    <!-- 添加/编辑模态框 -->
    <div
      v-if="showAddModal || showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      @click.self="closeModal"
    >
      <div class="bg-bg-secondary rounded-lg shadow-lg max-w-2xl w-full p-lg my-8">
        <h2 class="text-xl font-bold mb-md">
          {{ showEditModal ? '编辑实验' : '新建实验' }}
        </h2>

        <form @submit.prevent="saveExperiment" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              实验标题 <span class="text-danger">*</span>
            </label>
            <input
              v-model="expForm.title"
              type="text"
              required
              class="input"
              placeholder="输入实验标题"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              实验目标
            </label>
            <textarea
              v-model="expForm.objective"
              rows="2"
              class="textarea"
              placeholder="描述实验要达到的目标"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              实验方法
            </label>
            <textarea
              v-model="expForm.methodology"
              rows="4"
              class="textarea"
              placeholder="描述实验的具体方法和步骤"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              预期结果
            </label>
            <textarea
              v-model="expForm.expected_results"
              rows="2"
              class="textarea"
              placeholder="描述预期的实验结果"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              实际结果
            </label>
            <textarea
              v-model="expForm.actual_results"
              rows="2"
              class="textarea"
              placeholder="记录实际的实验结果"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                状态
              </label>
              <select v-model="expForm.status" class="select">
                <option value="planned">已计划</option>
                <option value="ongoing">进行中</option>
                <option value="completed">已完成</option>
                <option value="failed">失败</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                开始日期
              </label>
              <input
                v-model="expForm.start_date"
                type="date"
                class="input"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                结束日期
              </label>
              <input
                v-model="expForm.end_date"
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
import { ref, onMounted } from 'vue'
import { experimentAPI } from '@/api'
import dayjs from 'dayjs'

const experiments = ref([])
const filterStatus = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)

const expForm = ref({
  id: null,
  title: '',
  objective: '',
  methodology: '',
  expected_results: '',
  actual_results: '',
  status: 'planned',
  start_date: '',
  end_date: ''
})

const statusMap = {
  planned: '已计划',
  ongoing: '进行中',
  completed: '已完成',
  failed: '失败'
}

const getStatusBadgeClass = (status) => {
  const map = {
    planned: 'bg-gray-100 text-gray-800',
    ongoing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }
  return map[status] || ''
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const fetchExperiments = async () => {
  try {
    const params = {}
    if (filterStatus.value) params.status = filterStatus.value

    experiments.value = await experimentAPI.getAll(params)
  } catch (error) {
    console.error('获取实验列表失败:', error)
  }
}

const editExperiment = (exp) => {
  expForm.value = {
    ...exp,
    start_date: exp.start_date ? dayjs(exp.start_date).format('YYYY-MM-DD') : '',
    end_date: exp.end_date ? dayjs(exp.end_date).format('YYYY-MM-DD') : ''
  }
  showEditModal.value = true
}

const deleteExperiment = async (id) => {
  if (confirm('确定要删除这个实验吗?')) {
    try {
      await experimentAPI.delete(id)
      await fetchExperiments()
    } catch (error) {
      alert('删除失败: ' + error.message)
    }
  }
}

const saveExperiment = async () => {
  try {
    if (showEditModal.value) {
      await experimentAPI.update(expForm.value.id, expForm.value)
    } else {
      await experimentAPI.create(expForm.value)
    }
    await fetchExperiments()
    closeModal()
  } catch (error) {
    alert('保存失败: ' + error.message)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  expForm.value = {
    id: null,
    title: '',
    objective: '',
    methodology: '',
    expected_results: '',
    actual_results: '',
    status: 'planned',
    start_date: '',
    end_date: ''
  }
}

onMounted(() => {
  fetchExperiments()
})
</script>
