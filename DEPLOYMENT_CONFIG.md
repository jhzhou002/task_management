# 部署配置总结

## 重要变更

### 1. 后端端口变更
- **原端口**: 3000
- **新端口**: 3001
- **原因**: 服务器3000端口已被占用

### 2. 后端域名
- **生产环境域名**: `taskapi.aihubzone.cn`
- **访问地址**: `https://taskapi.aihubzone.cn/api`

## 配置文件清单

### 后端配置

**文件**: `backend/.env`
```env
PORT=3001
DB_HOST=49.235.74.98
DB_USER=connect_4c8c
DB_PASSWORD=zhjh0704
DB_NAME=task_management
```

### 前端配置

**开发环境**: `frontend/.env.development`
```env
VITE_API_BASE_URL=/api
```

**生产环境**: `frontend/.env.production`
```env
VITE_API_BASE_URL=https://taskapi.aihubzone.cn/api
```

**Vite配置**: `frontend/vite.config.js`
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',  // 注意：已改为3001
      changeOrigin: true
    }
  }
}
```

**API配置**: `frontend/src/api/index.js`
- 自动根据环境切换API地址
- 开发环境：使用Vite代理 `/api` -> `http://localhost:3001`
- 生产环境：直接访问 `https://taskapi.aihubzone.cn/api`

## 环境说明

### 开发环境
```
前端: http://localhost:5173
后端: http://localhost:3001
数据库: 49.235.74.98:3306
```

**数据流**:
```
浏览器 -> localhost:5173 -> Vite代理 -> localhost:3001 -> MySQL
```

### 生产环境
```
前端: https://yourdomain.com
后端: https://taskapi.aihubzone.cn
数据库: 49.235.74.98:3306 (或本地MySQL)
```

**数据流**:
```
浏览器 -> yourdomain.com -> taskapi.aihubzone.cn:443 -> localhost:3001 -> MySQL
```

## 部署清单

### 后端部署步骤
1. ✅ 上传代码到服务器
2. ✅ 配置 `.env` 文件（端口3001）
3. ✅ 安装依赖：`npm install`
4. ✅ 使用PM2启动：`pm2 start server.js --name task-backend`
5. ✅ 配置Nginx反向代理（taskapi.aihubzone.cn）
6. ✅ 配置SSL证书（HTTPS）
7. ✅ 开启防火墙3001端口（仅内网）

### 前端部署步骤
1. ✅ 本地构建：`npm run build`
2. ✅ 确认生产环境变量配置
3. ✅ 上传dist目录到服务器
4. ✅ 配置Nginx静态文件服务
5. ✅ 配置SSL证书（可选）

## 测试验证

### 后端测试
```bash
# 本地测试
curl http://localhost:3001/health

# 远程测试
curl https://taskapi.aihubzone.cn/api/health
```

预期返回：
```json
{"status":"ok","timestamp":"2024-xx-xx"}
```

### 前端测试
1. 访问前端域名
2. 打开浏览器开发者工具 -> Network
3. 执行任何操作（如查看任务列表）
4. 检查API请求地址是否为 `https://taskapi.aihubzone.cn/api/*`

## 常见问题

### 1. CORS跨域问题
如果前端访问后端出现跨域错误，在后端Nginx配置中添加CORS头：
```nginx
add_header Access-Control-Allow-Origin * always;
add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
add_header Access-Control-Allow-Headers 'Content-Type, Authorization' always;
```

### 2. 502 Bad Gateway
- 检查后端是否启动：`pm2 status`
- 检查端口是否正确：`netstat -tulpn | grep 3001`
- 查看后端日志：`pm2 logs task-backend`

### 3. API请求失败
- 检查域名解析：`ping taskapi.aihubzone.cn`
- 检查SSL证书是否有效
- 查看浏览器控制台错误信息

### 4. 环境变量未生效
- 确认构建时环境变量文件存在
- 清除构建缓存：`rm -rf dist` 后重新构建
- 检查文件名：`.env.production`（不是 `.env.prod`）

## 安全建议

1. **数据库密码**: 生产环境使用强密码
2. **HTTPS**: 强制使用HTTPS加密传输
3. **防火墙**:
   - 3001端口仅开放给内网
   - 对外只开放80/443端口
4. **API限流**: 建议添加请求频率限制
5. **备份**: 定期备份数据库

## 更新部署

### 更新后端
```bash
cd /www/wwwroot/task-backend
git pull
npm install
pm2 restart task-backend
```

### 更新前端
```bash
# 本地
cd frontend
npm run build

# 上传到服务器
scp -r dist/* root@server:/www/wwwroot/task-frontend/
```

## 监控命令

```bash
# 查看后端状态
pm2 status

# 查看后端日志
pm2 logs task-backend

# 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 查看端口占用
netstat -tulpn | grep 3001

# 查看系统资源
htop
```
