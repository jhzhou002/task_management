<template>
  <div class="space-y-md">
    <!-- 工具栏 -->
    <div class="card">
      <div class="flex flex-col md:flex-row gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索论文..."
          class="input flex-1"
        />

        <select v-model="filterStatus" class="select" @change="fetchPapers">
          <option value="">全部状态</option>
          <option value="to_read">待阅读</option>
          <option value="reading">阅读中</option>
          <option value="completed">已完成</option>
        </select>

        <button @click="showAddModal = true" class="btn-primary whitespace-nowrap">
          ➕ 添加论文
        </button>
      </div>
    </div>

    <!-- 统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-md">
      <div class="card">
        <p class="text-text-secondary text-sm">总计</p>
        <p class="text-2xl font-bold text-text-primary mt-1">{{ papers.length }}</p>
      </div>
      <div class="card">
        <p class="text-text-secondary text-sm">待阅读</p>
        <p class="text-2xl font-bold text-warning mt-1">{{ toReadCount }}</p>
      </div>
      <div class="card">
        <p class="text-text-secondary text-sm">阅读中</p>
        <p class="text-2xl font-bold text-info mt-1">{{ readingCount }}</p>
      </div>
      <div class="card">
        <p class="text-text-secondary text-sm">已完成</p>
        <p class="text-2xl font-bold text-success mt-1">{{ completedCount }}</p>
      </div>
    </div>

    <!-- 论文列表 -->
    <div class="space-y-3">
      <div
        v-for="paper in filteredPapers"
        :key="paper.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="font-semibold text-text-primary mb-1">{{ paper.title }}</h3>
            <p v-if="paper.authors" class="text-sm text-text-secondary">
              作者: {{ paper.authors }}
            </p>
            <div v-if="paper.publication || paper.year" class="text-sm text-text-muted mt-1">
              <span v-if="paper.publication">{{ paper.publication }}</span>
              <span v-if="paper.year"> ({{ paper.year }})</span>
            </div>
          </div>

          <div class="flex flex-col items-end gap-2">
            <span :class="`badge ${getStatusBadgeClass(paper.status)}`">
              {{ statusMap[paper.status] }}
            </span>
            <div v-if="paper.rating" class="text-yellow-500">
              {{ '★'.repeat(paper.rating) }}{{ '☆'.repeat(5 - paper.rating) }}
            </div>
          </div>
        </div>

        <div v-if="paper.key_points" class="bg-bg-hover p-3 rounded mb-3">
          <p class="text-sm text-text-primary font-medium mb-1">关键要点:</p>
          <p class="text-sm text-text-secondary whitespace-pre-wrap">{{ paper.key_points }}</p>
        </div>

        <div v-if="paper.notes" class="bg-white p-3 rounded mb-3">
          <p class="text-sm text-text-primary font-medium mb-1">阅读笔记:</p>
          <p class="text-sm text-text-secondary whitespace-pre-wrap">{{ paper.notes }}</p>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-border">
          <a
            v-if="paper.pdf_link"
            :href="paper.pdf_link"
            target="_blank"
            class="text-sm text-primary hover:underline"
          >
            📎 查看PDF
          </a>
          <div class="flex gap-2 ml-auto">
            <button @click="editPaper(paper)" class="btn-sm btn-secondary">
              编辑
            </button>
            <button @click="deletePaper(paper.id)" class="btn-sm btn-danger">
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredPapers.length === 0" class="card text-center py-16 text-text-muted">
        <div class="text-6xl mb-4">📄</div>
        <p class="text-lg">暂无论文记录</p>
        <button @click="showAddModal = true" class="btn-primary mt-4">
          添加第一篇论文
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
          {{ showEditModal ? '编辑论文' : '添加论文' }}
        </h2>

        <form @submit.prevent="savePaper" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              论文标题 <span class="text-danger">*</span>
            </label>
            <input
              v-model="paperForm.title"
              type="text"
              required
              class="input"
              placeholder="输入论文标题"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                作者
              </label>
              <input
                v-model="paperForm.authors"
                type="text"
                class="input"
                placeholder="如: Zhang et al."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                发表年份
              </label>
              <input
                v-model.number="paperForm.year"
                type="number"
                class="input"
                placeholder="2024"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              发表位置/期刊
            </label>
            <input
              v-model="paperForm.publication"
              type="text"
              class="input"
              placeholder="如: NeurIPS, CVPR"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                状态
              </label>
              <select v-model="paperForm.status" class="select">
                <option value="to_read">待阅读</option>
                <option value="reading">阅读中</option>
                <option value="completed">已完成</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-text-primary mb-1">
                评分
              </label>
              <select v-model.number="paperForm.rating" class="select">
                <option :value="null">未评分</option>
                <option :value="5">5星 - 优秀</option>
                <option :value="4">4星 - 很好</option>
                <option :value="3">3星 - 良好</option>
                <option :value="2">2星 - 一般</option>
                <option :value="1">1星 - 较差</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              PDF链接
            </label>
            <input
              v-model="paperForm.pdf_link"
              type="url"
              class="input"
              placeholder="https://"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              关键要点
            </label>
            <textarea
              v-model="paperForm.key_points"
              rows="3"
              class="textarea"
              placeholder="记录论文的核心思想、方法、创新点等"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-1">
              阅读笔记
            </label>
            <textarea
              v-model="paperForm.notes"
              rows="4"
              class="textarea"
              placeholder="记录阅读心得、疑问、可应用的点等"
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
import { paperAPI } from '@/api'

const papers = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)

const paperForm = ref({
  id: null,
  title: '',
  authors: '',
  publication: '',
  year: null,
  status: 'to_read',
  notes: '',
  key_points: '',
  rating: null,
  pdf_link: ''
})

const statusMap = {
  to_read: '待阅读',
  reading: '阅读中',
  completed: '已完成'
}

const filteredPapers = computed(() => {
  let result = papers.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(query) ||
      (p.authors && p.authors.toLowerCase().includes(query))
    )
  }

  return result
})

const toReadCount = computed(() => papers.value.filter(p => p.status === 'to_read').length)
const readingCount = computed(() => papers.value.filter(p => p.status === 'reading').length)
const completedCount = computed(() => papers.value.filter(p => p.status === 'completed').length)

const getStatusBadgeClass = (status) => {
  const map = {
    to_read: 'bg-gray-100 text-gray-800',
    reading: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  }
  return map[status] || ''
}

const fetchPapers = async () => {
  try {
    const params = {}
    if (filterStatus.value) params.status = filterStatus.value

    papers.value = await paperAPI.getAll(params)
  } catch (error) {
    console.error('获取论文列表失败:', error)
  }
}

const editPaper = (paper) => {
  paperForm.value = { ...paper }
  showEditModal.value = true
}

const deletePaper = async (id) => {
  if (confirm('确定要删除这篇论文吗?')) {
    try {
      await paperAPI.delete(id)
      await fetchPapers()
    } catch (error) {
      alert('删除失败: ' + error.message)
    }
  }
}

const savePaper = async () => {
  try {
    if (showEditModal.value) {
      await paperAPI.update(paperForm.value.id, paperForm.value)
    } else {
      await paperAPI.create(paperForm.value)
    }
    await fetchPapers()
    closeModal()
  } catch (error) {
    alert('保存失败: ' + error.message)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  paperForm.value = {
    id: null,
    title: '',
    authors: '',
    publication: '',
    year: null,
    status: 'to_read',
    notes: '',
    key_points: '',
    rating: null,
    pdf_link: ''
  }
}

onMounted(() => {
  fetchPapers()
})
</script>
