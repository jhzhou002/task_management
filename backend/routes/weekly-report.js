const express = require('express');
const router = express.Router();
const db = require('../db');

// 生成周报
router.get('/generate', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    // 获取本周完成的任务
    const [completedTasks] = await db.query(`
      SELECT * FROM tasks
      WHERE status = 'completed'
        AND completed_at BETWEEN ? AND ?
      ORDER BY category, completed_at
    `, [start_date, end_date]);

    // 获取未完成的任务
    const [pendingTasks] = await db.query(`
      SELECT * FROM tasks
      WHERE status != 'completed'
        AND created_at BETWEEN ? AND ?
      ORDER BY priority DESC, due_date
    `, [start_date, end_date]);

    // 获取学习记录
    const [learningRecords] = await db.query(`
      SELECT * FROM learning_progress
      WHERE date BETWEEN ? AND ?
      ORDER BY date DESC
    `, [start_date, end_date]);

    // 计算学习总时长
    const [learningStats] = await db.query(`
      SELECT
        SUM(hours) as total_hours,
        COUNT(DISTINCT subject) as subjects_count
      FROM learning_progress
      WHERE date BETWEEN ? AND ?
    `, [start_date, end_date]);

    // 获取论文阅读记录
    const [papersRead] = await db.query(`
      SELECT * FROM paper_reading
      WHERE read_at BETWEEN ? AND ?
      ORDER BY read_at DESC
    `, [start_date, end_date]);

    // 获取实验记录
    const [experiments] = await db.query(`
      SELECT * FROM experiment_plans
      WHERE (start_date BETWEEN ? AND ?)
         OR (end_date BETWEEN ? AND ?)
      ORDER BY status, start_date
    `, [start_date, end_date, start_date, end_date]);

    // 任务统计
    const taskStats = {
      total: completedTasks.length + pendingTasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      completion_rate: completedTasks.length + pendingTasks.length > 0
        ? ((completedTasks.length / (completedTasks.length + pendingTasks.length)) * 100).toFixed(2)
        : 0
    };

    // 按分类统计
    const tasksByCategory = completedTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      period: { start_date, end_date },
      summary: {
        tasks: taskStats,
        learning: learningStats[0],
        papers_read: papersRead.length,
        experiments: experiments.length
      },
      details: {
        completed_tasks: completedTasks,
        pending_tasks: pendingTasks,
        tasks_by_category: tasksByCategory,
        learning_records: learningRecords,
        papers: papersRead,
        experiments: experiments
      }
    });
  } catch (error) {
    console.error('生成周报失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取本周日期范围
router.get('/current-week', async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 周一开始

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    res.json({
      start_date: monday.toISOString().split('T')[0],
      end_date: sunday.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('获取当前周失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
