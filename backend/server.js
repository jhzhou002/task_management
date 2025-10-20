const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 导入路由
const taskRoutes = require('./routes/tasks');
const learningRoutes = require('./routes/learning');
const paperRoutes = require('./routes/papers');
const experimentRoutes = require('./routes/experiments');
const statisticsRoutes = require('./routes/statistics');
const weeklyReportRoutes = require('./routes/weekly-report');

// 使用路由
app.use('/api/tasks', taskRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/reports', weeklyReportRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
