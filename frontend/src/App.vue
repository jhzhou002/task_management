<template>
  <div id="app" class="min-h-screen bg-bg-primary">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTaskStore } from './stores/taskStore'

const taskStore = useTaskStore()

onMounted(() => {
  // 初始化加载数据
  taskStore.fetchTasks()
})
</script>
