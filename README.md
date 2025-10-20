# 任务管理系统

一个专为研究生设计的全栈任务管理系统，支持科研任务跟踪、学习进度记录、论文阅读管理和实验计划制定。

## ⚠️ 重要配置说明

### 端口配置
- **后端端口**: `3001` (原3000端口已改为3001)
- **前端端口**: `5173` (开发环境)

### 生产环境配置
- **后端API域名**: `https://taskapi.aihubzone.cn`
- **前端访问**: 前端会自动根据环境访问对应的后端地址
  - 开发环境: 通过Vite代理访问 `localhost:3001`
  - 生产环境: 直接访问 `https://taskapi.aihubzone.cn/api`

### 环境变量
项目使用环境变量管理配置，详见：
- 后端: `backend/.env`
- 前端开发: `frontend/.env.development`
- 前端生产: `frontend/.env.production`

## 功能特性

### 核心功能
- ✅ **任务管理**: 创建、编辑、删除任务，支持多种分类和优先级
- 📅 **多日期视图**: 查看今日、本周、过期任务
- 📊 **统计分析**: 完成率、任务分布等数据可视化
- 📝 **周报生成**: 自动生成周报，支持导出和复制
- 🏷️ **任务分类**: 科研/课程/生活三大类别
- 🔍 **搜索功能**: 快速搜索历史任务
- 📚 **学习记录**: 记录学习时长和内容
- 📄 **论文管理**: 管理论文阅读状态和笔记
- 🔬 **实验计划**: 规划和追踪实验进度
- 📱 **响应式设计**: 完美支持桌面端、平板和移动端

## 技术栈

### 前端
- **Vue 3**: 渐进式JavaScript框架
- **Vite**: 下一代前端构建工具
- **Pinia**: Vue状态管理
- **TailwindCSS**: 实用优先的CSS框架
- **Axios**: HTTP客户端
- **Day.js**: 轻量级日期处理库

### 后端
- **Node.js**: JavaScript运行时
- **Express**: Web应用框架
- **MySQL**: 关系型数据库
- **mysql2**: MySQL客户端

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- MySQL >= 5.7
- npm 或 yarn

### 1. 克隆项目
```bash
git clone <repository-url>
cd task-management
```

### 2. 数据库配置

#### 创建数据库
登录MySQL并创建数据库：
```sql
CREATE DATABASE task_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 导入数据表结构
```bash
mysql -h 49.235.74.98 -u connect_4c8c -p task_management < backend/database.sql
```

或在MySQL命令行中执行：
```sql
USE task_management;
SOURCE backend/database.sql;
```

### 3. 后端配置

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
# 编辑 .env 文件，确认以下配置：
# PORT=3001  (注意：已改为3001端口)
# DB_HOST=49.235.74.98
# DB_USER=connect_4c8c
# DB_PASSWORD=zhjh0704
# DB_NAME=task_management

# 启动后端服务
npm start

# 开发模式（自动重启）
npm run dev
```

后端将在 `http://localhost:3001` 运行

### 4. 前端配置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产环境构建
npm run build
```

前端将在 `http://localhost:5173` 运行

**重要说明**：
- 开发环境：前端通过Vite代理访问 `http://localhost:3001`
- 生产环境：前端直接访问 `https://taskapi.aihubzone.cn/api`

### 5. 访问应用
打开浏览器访问: `http://localhost:5173`

## 项目结构

```
task-management/
├── backend/                 # 后端代码
│   ├── routes/             # API路由
│   │   ├── tasks.js        # 任务管理API
│   │   ├── learning.js     # 学习记录API
│   │   ├── papers.js       # 论文管理API
│   │   ├── experiments.js  # 实验计划API
│   │   ├── statistics.js   # 统计数据API
│   │   └── weekly-report.js # 周报生成API
│   ├── db.js               # 数据库连接
│   ├── server.js           # 服务器入口
│   ├── database.sql        # 数据库结构
│   ├── package.json        # 后端依赖
│   └── .env               # 环境变量配置
│
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── api/           # API接口封装
│   │   ├── components/    # Vue组件
│   │   ├── stores/        # Pinia状态管理
│   │   ├── views/         # 页面视图
│   │   │   ├── Layout.vue      # 主布局
│   │   │   ├── Dashboard.vue   # 仪表盘
│   │   │   ├── Tasks.vue       # 任务管理
│   │   │   ├── Learning.vue    # 学习记录
│   │   │   ├── Papers.vue      # 论文管理
│   │   │   ├── Experiments.vue # 实验计划
│   │   │   └── Reports.vue     # 周报生成
│   │   ├── router/        # 路由配置
│   │   ├── App.vue        # 根组件
│   │   ├── main.js        # 入口文件
│   │   └── style.css      # 全局样式
│   ├── index.html
│   ├── package.json       # 前端依赖
│   ├── vite.config.js     # Vite配置
│   └── tailwind.config.js # Tailwind配置
│
└── README.md              # 项目文档
```

## API文档

### 任务管理 API

#### 获取任务列表
```
GET /api/tasks
Query: category, status, date, search
```

#### 创建任务
```
POST /api/tasks
Body: { title, description, category, status, priority, due_date }
```

#### 更新任务
```
PUT /api/tasks/:id
Body: { title, description, category, status, priority, due_date }
```

#### 删除任务
```
DELETE /api/tasks/:id
```

### 学习记录 API

```
GET    /api/learning          # 获取学习记录
POST   /api/learning          # 创建学习记录
PUT    /api/learning/:id      # 更新学习记录
DELETE /api/learning/:id      # 删除学习记录
```

### 论文管理 API

```
GET    /api/papers            # 获取论文列表
POST   /api/papers            # 添加论文
PUT    /api/papers/:id        # 更新论文
DELETE /api/papers/:id        # 删除论文
```

### 实验计划 API

```
GET    /api/experiments       # 获取实验列表
POST   /api/experiments       # 创建实验
PUT    /api/experiments/:id   # 更新实验
DELETE /api/experiments/:id   # 删除实验
```

### 统计 API

```
GET /api/statistics/tasks     # 任务统计
GET /api/statistics/learning  # 学习统计
GET /api/statistics/papers    # 论文统计
```

### 周报 API

```
GET /api/reports/generate     # 生成周报
GET /api/reports/current-week # 获取当前周日期范围
```

## 部署到宝塔面板

### 1. 前端构建
```bash
cd frontend
npm run build
```
构建产物在 `frontend/dist` 目录

### 2. 宝塔面板配置

#### 创建网站
1. 登录宝塔面板
2. 点击"网站" -> "添加站点"
3. 填写域名和网站目录
4. 上传 `frontend/dist` 目录内容到网站根目录

#### 配置Nginx反向代理
在网站设置 -> 配置文件中添加：

```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

#### 部署后端
1. 上传 `backend` 目录到服务器（如 `/www/wwwroot/task-backend`）
2. 安装依赖：`npm install`
3. 使用 PM2 管理进程：
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name task-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 3. 数据库配置
确保MySQL服务运行，并导入数据库结构。

## 配色方案

系统采用清爽的蓝色主题：

- **主色调**: `#3B82F6` (清爽蓝)
- **成功色**: `#10B981` (绿色)
- **警告色**: `#F59E0B` (橙色)
- **危险色**: `#EF4444` (红色)
- **信息色**: `#06B6D4` (青色)

## 开发说明

### 添加新功能
1. 后端：在 `backend/routes/` 添加新路由
2. 前端：在 `frontend/src/views/` 添加新页面
3. 更新路由：在 `frontend/src/router/index.js` 注册路由

### 样式自定义
在 `frontend/tailwind.config.js` 中修改配色方案和设计规范。

## 常见问题

### 1. 数据库连接失败
- 检查 `.env` 文件中的数据库配置
- 确认MySQL服务正在运行
- 检查防火墙设置

### 2. 前端无法请求API
- 检查后端服务是否启动
- 确认 `vite.config.js` 中的代理配置
- 查看浏览器控制台错误信息

### 3. 端口被占用
修改配置文件中的端口：
- 后端: `backend/.env` 中的 `PORT`
- 前端: `frontend/vite.config.js` 中的 `server.port`

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 作者

研一工具开发项目

## 更新日志

### v1.0.0 (2024)
- 初始版本发布
- 实现基础任务管理功能
- 添加学习记录、论文管理和实验计划模块
- 实现周报生成功能
- 完成响应式设计
