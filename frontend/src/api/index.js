import axios from 'axios'

// 根据环境动态设置API地址
const getBaseURL = () => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  // 生产环境：使用完整域名
  if (import.meta.env.PROD) {
    return 'https://taskapi.aihubzone.cn/api'
  }

  // 开发环境：使用代理
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
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

    // 统一错误处理
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response

      switch (status) {
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        case 502:
        case 503:
          console.error('服务器暂时不可用')
          break
        default:
          console.error(data?.error || '请求失败')
      }
    } else if (error.request) {
      // 请求已发出但未收到响应
      console.error('网络连接失败，请检查网络')
    } else {
      // 其他错误
      console.error('请求配置错误')
    }

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
