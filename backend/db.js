const mysql = require('mysql2');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// 使用 promise 包装
const promisePool = pool.promise();

// 测试连接
pool.getConnection((err, connection) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
    return;
  }
  console.log('✅ 数据库连接成功');
  connection.release();
});

module.exports = promisePool;
