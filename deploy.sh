#!/bin/bash

# 任务管理系统 - 快速部署脚本（服务器端）
# 使用方法: bash deploy.sh

set -e

echo "========================================"
echo "任务管理系统 - 服务器部署"
echo "========================================"

# 配置变量
BACKEND_DIR="/www/wwwroot/task-backend"
FRONTEND_DIR="/www/wwwroot/task-frontend"
APP_NAME="task-backend"
PORT=3001

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}错误: 请使用root权限运行此脚本${NC}"
  exit 1
fi

# 1. 部署后端
echo -e "\n${YELLOW}[1/5] 部署后端...${NC}"

if [ ! -d "$BACKEND_DIR" ]; then
  echo -e "${RED}错误: 后端目录不存在: $BACKEND_DIR${NC}"
  exit 1
fi

cd $BACKEND_DIR

# 安装依赖
echo "安装依赖..."
npm install --production

# 检查.env文件
if [ ! -f ".env" ]; then
  echo -e "${RED}错误: .env文件不存在${NC}"
  exit 1
fi

# 检查端口配置
if ! grep -q "PORT=3001" .env; then
  echo -e "${YELLOW}警告: .env文件中端口不是3001${NC}"
fi

# 2. 启动后端
echo -e "\n${YELLOW}[2/5] 启动后端服务...${NC}"

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
  echo "安装PM2..."
  npm install -g pm2
fi

# 停止旧进程
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

# 启动新进程
pm2 start server.js --name $APP_NAME
pm2 save

echo -e "${GREEN}✓ 后端服务已启动${NC}"

# 3. 检查端口
echo -e "\n${YELLOW}[3/5] 检查端口...${NC}"
sleep 2

if netstat -tulpn | grep -q ":$PORT"; then
  echo -e "${GREEN}✓ 端口 $PORT 正在监听${NC}"
else
  echo -e "${RED}✗ 端口 $PORT 未监听，请检查日志${NC}"
  pm2 logs $APP_NAME --lines 20
  exit 1
fi

# 4. 测试后端API
echo -e "\n${YELLOW}[4/5] 测试后端API...${NC}"
sleep 1

response=$(curl -s http://localhost:$PORT/health || echo "failed")

if echo "$response" | grep -q "ok"; then
  echo -e "${GREEN}✓ 后端API测试成功${NC}"
  echo "响应: $response"
else
  echo -e "${RED}✗ 后端API测试失败${NC}"
  exit 1
fi

# 5. 显示状态
echo -e "\n${YELLOW}[5/5] 服务状态${NC}"
pm2 status

echo -e "\n========================================"
echo -e "${GREEN}部署完成！${NC}"
echo -e "========================================\n"

echo "服务信息:"
echo "  - 后端端口: $PORT"
echo "  - 进程名称: $APP_NAME"
echo -e "  - 状态: ${GREEN}运行中${NC}"

echo -e "\n常用命令:"
echo "  查看日志: pm2 logs $APP_NAME"
echo "  重启服务: pm2 restart $APP_NAME"
echo "  停止服务: pm2 stop $APP_NAME"
echo "  查看状态: pm2 status"

echo -e "\n访问地址:"
echo "  - 本地: http://localhost:$PORT/health"
echo "  - 公网: https://taskapi.aihubzone.cn/api/health"

echo -e "\n${YELLOW}提示: 请确保已配置Nginx反向代理和SSL证书${NC}"
