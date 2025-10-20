import { defineStore } from 'pinia'
import { taskAPI } from '@/api'
import dayjs from 'dayjs'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    currentTask: null,
    loading: false,
    filter: {
      category: '',
      status: '',
      date: '',
      search: ''
    }
  }),

  getters: {
    // 获取今日任务
    todayTasks: (state) => {
      const today = dayjs().format('YYYY-MM-DD')
      return state.tasks.filter(task =>
        dayjs(task.due_date).format('YYYY-MM-DD') === today
      )
    },

    // 获取即将到期的任务
    upcomingTasks: (state) => {
      const today = dayjs()
      const nextWeek = today.add(7, 'day')
      return state.tasks.filter(task => {
        const dueDate = dayjs(task.due_date)
        return dueDate.isAfter(today) && dueDate.isBefore(nextWeek)
      })
    },

    // 获取过期任务
    overdueTasks: (state) => {
      const today = dayjs()
      return state.tasks.filter(task =>
        task.status !== 'completed' &&
        task.due_date &&
        dayjs(task.due_date).isBefore(today, 'day')
      )
    },

    // 按分类分组
    tasksByCategory: (state) => {
      return state.tasks.reduce((acc, task) => {
        if (!acc[task.category]) {
          acc[task.category] = []
        }
        acc[task.category].push(task)
        return acc
      }, {})
    },

    // 按状态分组
    tasksByStatus: (state) => {
      return state.tasks.reduce((acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = []
        }
        acc[task.status].push(task)
        return acc
      }, {})
    }
  },

  actions: {
    // 获取任务列表
    async fetchTasks(params = {}) {
      this.loading = true
      try {
        const filters = { ...this.filter, ...params }
        // 移除空值
        Object.keys(filters).forEach(key =>
          (filters[key] === '' || filters[key] === null) && delete filters[key]
        )

        this.tasks = await taskAPI.getAll(filters)
      } catch (error) {
        console.error('获取任务失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取指定日期范围的任务
    async fetchTasksInRange(startDate, endDate) {
      this.loading = true
      try {
        this.tasks = await taskAPI.getRange({
          start_date: startDate,
          end_date: endDate
        })
      } catch (error) {
        console.error('获取任务范围失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取任务详情
    async fetchTaskById(id) {
      this.loading = true
      try {
        this.currentTask = await taskAPI.getById(id)
      } catch (error) {
        console.error('获取任务详情失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 创建任务
    async createTask(taskData) {
      this.loading = true
      try {
        await taskAPI.create(taskData)
        await this.fetchTasks()
      } catch (error) {
        console.error('创建任务失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新任务
    async updateTask(id, taskData) {
      this.loading = true
      try {
        await taskAPI.update(id, taskData)
        await this.fetchTasks()
      } catch (error) {
        console.error('更新任务失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 删除任务
    async deleteTask(id) {
      this.loading = true
      try {
        await taskAPI.delete(id)
        await this.fetchTasks()
      } catch (error) {
        console.error('删除任务失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新任务状态
    async updateTaskStatus(id, status) {
      await this.updateTask(id, { status })
    },

    // 批量更新任务状态
    async batchUpdateStatus(ids, status) {
      this.loading = true
      try {
        await taskAPI.batchUpdateStatus({ ids, status })
        await this.fetchTasks()
      } catch (error) {
        console.error('批量更新失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 设置筛选条件
    setFilter(filter) {
      this.filter = { ...this.filter, ...filter }
    },

    // 清空筛选条件
    clearFilter() {
      this.filter = {
        category: '',
        status: '',
        date: '',
        search: ''
      }
    }
  }
})
