const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取任务统计信息
router.get('/tasks', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // 总体统计
    const [overall] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM tasks
      ${start_date && end_date ? 'WHERE created_at BETWEEN ? AND ?' : ''}
    `, start_date && end_date ? [start_date, end_date] : []);

    // 按分类统计
    const [byCategory] = await db.query(`
      SELECT
        category,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM tasks
      ${start_date && end_date ? 'WHERE created_at BETWEEN ? AND ?' : ''}
      GROUP BY category
    `, start_date && end_date ? [start_date, end_date] : []);

    // 按优先级统计
    const [byPriority] = await db.query(`
      SELECT
        priority,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM tasks
      ${start_date && end_date ? 'WHERE created_at BETWEEN ? AND ?' : ''}
      GROUP BY priority
    `, start_date && end_date ? [start_date, end_date] : []);

    // 每日完成数量（最近7天）
    const [dailyCompletion] = await db.query(`
      SELECT
        DATE(completed_at) as date,
        COUNT(*) as count
      FROM tasks
      WHERE status = 'completed'
        AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(completed_at)
      ORDER BY date DESC
    `);

    // 计算完成率
    const completionRate = overall[0].total > 0
      ? (overall[0].completed / overall[0].total * 100).toFixed(2)
      : 0;

    res.json({
      overall: {
        ...overall[0],
        completion_rate: completionRate
      },
      by_category: byCategory,
      by_priority: byPriority,
      daily_completion: dailyCompletion
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取学习时长统计
router.get('/learning', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // 总学习时长
    const [totalHours] = await db.query(`
      SELECT
        SUM(hours) as total_hours,
        COUNT(DISTINCT subject) as subjects_count
      FROM learning_progress
      ${start_date && end_date ? 'WHERE date BETWEEN ? AND ?' : ''}
    `, start_date && end_date ? [start_date, end_date] : []);

    // 按学科统计
    const [bySubject] = await db.query(`
      SELECT
        subject,
        SUM(hours) as total_hours,
        COUNT(*) as sessions
      FROM learning_progress
      ${start_date && end_date ? 'WHERE date BETWEEN ? AND ?' : ''}
      GROUP BY subject
      ORDER BY total_hours DESC
    `, start_date && end_date ? [start_date, end_date] : []);

    // 每日学习时长（最近7天）
    const [dailyHours] = await db.query(`
      SELECT
        date,
        SUM(hours) as hours
      FROM learning_progress
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY date
      ORDER BY date DESC
    `);

    res.json({
      total: totalHours[0],
      by_subject: bySubject,
      daily_hours: dailyHours
    });
  } catch (error) {
    console.error('获取学习统计失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取论文阅读统计
router.get('/papers', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'reading' THEN 1 ELSE 0 END) as reading,
        SUM(CASE WHEN status = 'to_read' THEN 1 ELSE 0 END) as to_read,
        AVG(CASE WHEN rating IS NOT NULL THEN rating ELSE NULL END) as avg_rating
      FROM paper_reading
    `);

    // 按年份统计
    const [byYear] = await db.query(`
      SELECT
        year,
        COUNT(*) as count
      FROM paper_reading
      WHERE year IS NOT NULL
      GROUP BY year
      ORDER BY year DESC
    `);

    res.json({
      overall: stats[0],
      by_year: byYear
    });
  } catch (error) {
    console.error('获取论文统计失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
