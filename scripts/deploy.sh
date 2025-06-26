#!/bin/bash

# Sui 合约部署脚本
# 使用方法: ./scripts/deploy.sh

set -e

echo "🚀 开始部署 Sui 合约..."

# 检查 Sui CLI 是否安装
if ! command -v sui &> /dev/null; then
    echo "❌ Sui CLI 未安装，请先安装 Sui CLI"
    echo "安装方法: brew install sui"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -d "move" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 进入合约目录
cd move

echo "📦 构建合约..."
sui move build

echo "💰 检查余额..."
BALANCE=$(sui client balance --json | jq -r '.totalBalance')
echo "当前余额: $BALANCE SUI"

if [ "$BALANCE" -lt 100000000 ]; then
    echo "⚠️  余额不足，正在获取测试代币..."
    sui client faucet
    sleep 5
fi

echo "🚀 部署合约..."
DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 --json)

# 解析部署结果
PACKAGE_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
REGISTRY_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.objectType | contains("PublicKeyRegistry")) | .objectId')
STORAGE_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.objectType | contains("MessageStorage")) | .objectId')

echo "✅ 合约部署成功！"
echo ""
echo "📋 部署信息:"
echo "Package ID: $PACKAGE_ID"
echo "Registry Object ID: $REGISTRY_ID"
echo "Storage Object ID: $STORAGE_ID"
echo ""

# 创建环境变量文件
cd ..
cat > .env << EOF
# Sui Network Configuration
VITE_SUI_NETWORK=testnet

# Contract Configuration
VITE_SUI_PACKAGE_ID=$PACKAGE_ID
VITE_REGISTRY_OBJECT_ID=$REGISTRY_ID
VITE_STORAGE_OBJECT_ID=$STORAGE_ID

# Optional: Custom RPC endpoint
# VITE_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
EOF

echo "✅ 环境变量已保存到 .env 文件"
echo ""
echo "🎉 部署完成！现在可以启动应用并测试链上功能了。"
echo "运行: npm run dev"