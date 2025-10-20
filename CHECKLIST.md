# 配置检查清单

部署前请确认以下配置是否正确：

## ✅ 后端配置

### 1. 环境变量 (`backend/.env`)
```bash
PORT=3001                          # ✓ 必须是3001
DB_HOST=49.235.74.98              # ✓ 数据库地址
DB_USER=connect_4c8c              # ✓ 数据库用户
DB_PASSWORD=zhjh0704              # ✓ 数据库密码
DB_NAME=task_management           # ✓ 数据库名称
```

### 2. 数据库连接
- [ ] 数据库已创建
- [ ] 数据表已导入（执行 `database.sql`）
- [ ] 数据库可以正常连接

### 3. 服务器配置
- [ ] Node.js 已安装（>= 16.0）
- [ ] PM2 已安装
- [ ] 防火墙开放 3001 端口（仅内网）

## ✅ 前端配置

### 1. 环境变量

**开发环境** (`frontend/.env.development`)
```bash
VITE_API_BASE_URL=/api            # ✓ 使用代理
```

**生产环境** (`frontend/.env.production`)
```bash
VITE_API_BASE_URL=https://taskapi.aihubzone.cn/api    # ✓ 生产域名
```

### 2. Vite 配置 (`frontend/vite.config.js`)
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',    // ✓ 必须是3001
      changeOrigin: true
    }
  }
}
```

### 3. API 配置 (`frontend/src/api/index.js`)
- [ ] 已配置环境变量读取
- [ ] 生产环境使用完整域名
- [ ] 开发环境使用代理路径

## ✅ 部署配置

### 1. 后端Nginx配置
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name taskapi.aihubzone.cn;

    location / {
        proxy_pass http://localhost:3001;     # ✓ 端口3001
        # ... 其他配置
    }
}
```

### 2. 前端Nginx配置
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /www/wwwroot/task-frontend;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. SSL证书
- [ ] 后端域名已配置SSL (taskapi.aihubzone.cn)
- [ ] 前端域名已配置SSL（可选）
- [ ] 证书有效期正常

## ✅ 功能测试

### 1. 后端测试
```bash
# 本地测试
curl http://localhost:3001/health

# 预期结果
{"status":"ok","timestamp":"..."}

# 远程测试
curl https://taskapi.aihubzone.cn/api/health
```

### 2. 前端测试
- [ ] 打开前端页面
- [ ] 检查控制台无错误
- [ ] Network标签检查API请求地址
- [ ] 创建一个测试任务
- [ ] 查看任务列表
- [ ] 生成周报测试

### 3. 跨域测试
- [ ] 前端可以正常请求后端API
- [ ] 无CORS错误
- [ ] 所有API接口正常

## ✅ 数据验证

### 1. 数据库
```sql
-- 检查表是否存在
SHOW TABLES;

-- 检查任务表
SELECT COUNT(*) FROM tasks;

-- 检查学习记录表
SELECT COUNT(*) FROM learning_progress;
```

### 2. 数据完整性
- [ ] 所有必要的表已创建
- [ ] 默认标签已插入
- [ ] 索引已创建

## 常见错误排查

### 错误1: Connection refused (端口3000)
**原因**: 使用了旧的3000端口配置
**解决**:
1. 检查 `backend/.env` 端口是否为3001
2. 检查 `frontend/vite.config.js` 代理端口是否为3001
3. 重启后端服务

### 错误2: CORS错误
**原因**: 跨域配置不正确
**解决**:
1. 确认后端Nginx配置了CORS头
2. 检查前端生产环境API地址是否正确
3. 确认SSL证书配置正确（HTTP/HTTPS混用会导致CORS）

### 错误3: 404 Not Found
**原因**: API路径不正确
**解决**:
1. 开发环境检查Vite代理配置
2. 生产环境检查前端 `.env.production` 配置
3. 确认后端路由是否正确

### 错误4: 502 Bad Gateway
**原因**: 后端服务未启动
**解决**:
1. 检查PM2状态: `pm2 status`
2. 查看日志: `pm2 logs task-backend`
3. 重启服务: `pm2 restart task-backend`

## 部署前最终检查

运行以下命令确认所有配置正确：

```bash
# 1. 检查后端配置
cd backend
cat .env | grep PORT    # 应该显示 PORT=3001

# 2. 检查前端配置
cd frontend
cat .env.production | grep VITE_API_BASE_URL
# 应该显示 VITE_API_BASE_URL=https://taskapi.aihubzone.cn/api

# 3. 检查Vite配置
cat vite.config.js | grep "target"
# 应该显示 target: 'http://localhost:3001'

# 4. 测试数据库连接
mysql -h 49.235.74.98 -u connect_4c8c -p task_management
```

## 部署成功标志

- [✓] 后端服务在3001端口运行
- [✓] 访问 `http://localhost:3001/health` 返回成功
- [✓] 访问 `https://taskapi.aihubzone.cn/api/health` 返回成功
- [✓] 前端页面可以正常打开
- [✓] 前端可以获取任务列表
- [✓] 可以创建、编辑、删除任务
- [✓] 可以生成周报
- [✓] 移动端响应式正常

全部通过后，部署完成！
