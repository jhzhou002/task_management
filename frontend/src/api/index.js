import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 任务相关API
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  getRange: (params) => api.get('/tasks/range', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  batchUpdateStatus: (data) => api.patch('/tasks/batch/status', data)
}

// 学习记录API
export const learningAPI = {
  getAll: (params) => api.get('/learning', { params }),
  create: (data) => api.post('/learning', data),
  update: (id, data) => api.put(`/learning/${id}`, data),
  delete: (id) => api.delete(`/learning/${id}`)
}

// 论文阅读API
export const paperAPI = {
  getAll: (params) => api.get('/papers', { params }),
  getById: (id) => api.get(`/papers/${id}`),
  create: (data) => api.post('/papers', data),
  update: (id, data) => api.put(`/papers/${id}`, data),
  delete: (id) => api.delete(`/papers/${id}`)
}

// 实验计划API
export const experimentAPI = {
  getAll: (params) => api.get('/experiments', { params }),
  getById: (id) => api.get(`/experiments/${id}`),
  create: (data) => api.post('/experiments', data),
  update: (id, data) => api.put(`/experiments/${id}`, data),
  delete: (id) => api.delete(`/experiments/${id}`)
}

// 统计API
export const statisticsAPI = {
  getTasks: (params) => api.get('/statistics/tasks', { params }),
  getLearning: (params) => api.get('/statistics/learning', { params }),
  getPapers: () => api.get('/statistics/papers')
}

// 周报API
export const reportAPI = {
  generate: (params) => api.get('/reports/generate', { params }),
  getCurrentWeek: () => api.get('/reports/current-week')
}

export default api
