# 宝塔面板部署指南

本文档详细说明如何将任务管理系统部署到宝塔面板。

## 前置准备

### 1. 服务器要求
- 操作系统：Linux (CentOS 7+、Ubuntu 18.04+)
- 内存：至少 1GB
- 已安装宝塔面板 7.x+

### 2. 安装必要软件
在宝塔面板中安装：
- Nginx 1.18+
- MySQL 5.7+ 或 8.0+
- PM2 管理器
- Node.js 16+ (通过软件商店安装)

## 部署步骤

### 步骤1: 准备数据库

#### 1.1 创建数据库
1. 打开宝塔面板 -> 数据库
2. 点击"添加数据库"
3. 数据库名：`task_management`
4. 用户名：`connect_4c8c` (或自定义)
5. 密码：`zhjh0704` (或自定义)
6. 访问权限：选择"所有人"或指定IP

#### 1.2 导入数据表
方法1 - 使用宝塔面板：
1. 点击数据库 -> 管理 -> 导入
2. 选择 `backend/database.sql` 文件
3. 点击导入

方法2 - 使用命令行：
```bash
mysql -u connect_4c8c -p task_management < /path/to/backend/database.sql
```

### 步骤2: 部署后端

#### 2.1 上传后端代码
1. 在宝塔面板创建目录：`/www/wwwroot/task-backend`
2. 将 `backend` 文件夹内的所有文件上传到该目录
3. 或使用Git：
```bash
cd /www/wwwroot
git clone <your-repo-url> task-backend
cd task-backend/backend
```

#### 2.2 配置环境变量
编辑 `/www/wwwroot/task-backend/.env` 文件：

```env
PORT=3001
DB_HOST=localhost
DB_USER=connect_4c8c
DB_PASSWORD=zhjh0704
DB_NAME=task_management
```

**注意**：
- 端口已改为 **3001**（因为3000被占用）
- 如果MySQL在同一服务器，使用 `localhost`
- 如果使用远程数据库，填写实际IP地址

#### 2.3 安装依赖
```bash
cd /www/wwwroot/task-backend
npm install --production
```

#### 2.4 使用PM2启动
在宝塔面板中：
1. 点击"软件商店" -> "PM2管理器"
2. 点击"添加项目"
3. 填写配置：
   - 项目名称：`task-backend`
   - 启动文件：`/www/wwwroot/task-backend/server.js`
   - 运行目录：`/www/wwwroot/task-backend`
4. 点击启动

或使用命令行：
```bash
# 安装PM2 (如果未安装)
npm install -g pm2

# 启动应用
cd /www/wwwroot/task-backend
pm2 start server.js --name task-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs task-backend

# 设置开机自启
pm2 startup
pm2 save
```

#### 2.5 验证后端
访问: `http://your-server-ip:3001/health`

应该返回: `{"status":"ok","timestamp":"..."}`

### 步骤3: 部署前端

#### 3.1 本地构建
在开发机器上：
```bash
cd frontend

# 确认环境变量配置
# .env.production 文件应包含：
# VITE_API_BASE_URL=https://taskapi.aihubzone.cn/api

# 构建生产版本
npm run build
```

构建完成后，`dist` 目录包含所有静态文件。

**重要提示**：前端已配置为生产环境自动使用 `https://taskapi.aihubzone.cn/api` 作为后端地址

#### 3.2 创建网站
1. 宝塔面板 -> 网站 -> 添加站点
2. 填写配置：
   - 域名：`yourdomain.com` (或IP地址)
   - 根目录：`/www/wwwroot/task-frontend`
   - PHP版本：选择"纯静态"
3. 点击提交

#### 3.3 上传前端文件
将 `frontend/dist` 目录下的所有文件上传到 `/www/wwwroot/task-frontend`

或使用命令：
```bash
scp -r frontend/dist/* root@your-server:/www/wwwroot/task-frontend/
```

#### 3.4 配置Nginx
点击网站 -> 设置 -> 配置文件，添加以下配置：

**注意**：由于前端已直接配置后端域名，Nginx无需反向代理。如果需要通过前端域名代理后端API，可选择配置。

**方案1：前端直接访问后端域名（推荐）**
```nginx
server {
    listen 80;
    server_name yourdomain.com;  # 前端域名
    root /www/wwwroot/task-frontend;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 前端路由配置
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**方案2：通过前端域名代理后端（可选）**
如果希望前后端使用同一域名，添加以下配置：
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /www/wwwroot/task-frontend;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 前端路由配置
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API反向代理（注意改为3001端口）
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**后端域名配置（taskapi.aihubzone.cn）**
同时需要为后端配置域名和SSL：
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name taskapi.aihubzone.cn;

    # SSL证书配置（如果有）
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS配置（如果需要跨域）
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Content-Type, Authorization' always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
```

保存并重载Nginx：
```

保存并重载Nginx：
```bash
nginx -t
nginx -s reload
```

### 步骤4: 配置HTTPS (可选但推荐)

#### 4.1 申请SSL证书
1. 在网站设置 -> SSL
2. 选择"Let's Encrypt"
3. 点击申请
4. 勾选"强制HTTPS"

#### 4.2 或手动配置证书
如果已有证书：
1. 上传证书文件
2. 在网站设置 -> SSL -> 其他证书
3. 粘贴证书内容
4. 保存

### 步骤5: 配置防火墙

#### 5.1 宝塔安全规则
1. 面板 -> 安全
2. 确保开放端口：
   - 80 (HTTP)
   - 443 (HTTPS)
   - 3000 (后端API，仅内网)

#### 5.2 系统防火墙
```bash
# CentOS/RHEL
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent
firewall-cmd --reload

# Ubuntu
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
```

## 验证部署

### 1. 检查后端
```bash
# 查看PM2状态
pm2 status

# 查看后端日志
pm2 logs task-backend

# 测试API
curl http://localhost:3000/health
```

### 2. 检查前端
访问: `http://yourdomain.com`

应该能看到登录/首页界面

### 3. 测试完整流程
1. 创建一个任务
2. 查看任务列表
3. 生成周报
4. 检查移动端响应式

## 常见问题排查

### 问题1: 502 Bad Gateway
原因：后端未启动或端口错误

解决方案：
```bash
# 检查PM2状态
pm2 status

# 重启后端
pm2 restart task-backend

# 检查端口
netstat -tulpn | grep 3000
```

### 问题2: 数据库连接失败
原因：数据库配置错误

解决方案：
1. 检查 `.env` 文件配置
2. 测试数据库连接：
```bash
mysql -h localhost -u connect_4c8c -p task_management
```

### 问题3: API请求404
原因：Nginx配置错误

解决方案：
1. 检查Nginx配置中的 `location /api` 块
2. 重载Nginx: `nginx -s reload`
3. 查看Nginx错误日志: `/www/wwwroot/logs/`

### 问题4: 前端白屏
原因：构建文件路径错误或API地址配置错误

解决方案：
1. 检查浏览器控制台错误
2. 确认 `index.html` 正确加载
3. 检查API请求地址

## 性能优化

### 1. 开启Redis缓存 (可选)
```bash
# 安装Redis
# 在宝塔面板软件商店安装Redis

# 修改后端代码使用Redis缓存
```

### 2. 配置CDN (可选)
1. 将静态资源上传到CDN
2. 修改前端配置使用CDN地址

### 3. 数据库优化
```sql
-- 添加索引
ALTER TABLE tasks ADD INDEX idx_user_date (due_date, status);
ALTER TABLE learning_progress ADD INDEX idx_date_subject (date, subject);
```

## 备份策略

### 1. 数据库备份
在宝塔面板 -> 计划任务中设置：
- 任务类型：备份数据库
- 执行周期：每天
- 备份数据库：task_management

### 2. 代码备份
```bash
# 使用Git备份
cd /www/wwwroot/task-backend
git add .
git commit -m "backup"
git push

# 或使用宝塔计划任务备份目录
```

## 监控和维护

### 1. 设置监控
使用PM2监控：
```bash
pm2 install pm2-server-monit
```

### 2. 日志管理
```bash
# 查看PM2日志
pm2 logs task-backend

# 清理日志
pm2 flush

# Nginx日志
tail -f /www/wwwroot/logs/access.log
tail -f /www/wwwroot/logs/error.log
```

### 3. 定期更新
```bash
# 更新依赖
cd /www/wwwroot/task-backend
npm update

# 重启服务
pm2 restart task-backend
```

## 技术支持

如遇到问题：
1. 查看PM2日志: `pm2 logs task-backend`
2. 查看Nginx日志: `/www/wwwroot/logs/`
3. 查看MySQL日志: 宝塔面板 -> 数据库 -> 日志
4. 提交Issue到项目仓库

## 更新部署

### 更新后端
```bash
cd /www/wwwroot/task-backend
git pull  # 或重新上传文件
npm install
pm2 restart task-backend
```

### 更新前端
```bash
# 本地构建
cd frontend
npm run build

# 上传dist目录到服务器
scp -r dist/* root@your-server:/www/wwwroot/task-frontend/
```

完成以上步骤后，任务管理系统应该已成功部署！
