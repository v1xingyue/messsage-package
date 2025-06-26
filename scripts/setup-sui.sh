#!/bin/bash

# Sui 环境设置脚本
# 使用方法: ./scripts/setup-sui.sh

set -e

echo "🔧 设置 Sui 开发环境..."

# 检查 Sui CLI 是否安装
if ! command -v sui &> /dev/null; then
    echo "❌ Sui CLI 未安装"
    echo "请按照以下步骤安装:"
    echo ""
    echo "macOS:"
    echo "  brew install sui"
    echo ""
    echo "从源码编译:"
    echo "  git clone https://github.com/MystenLabs/sui.git"
    echo "  cd sui"
    echo "  cargo build --release --bin sui"
    echo ""
    exit 1
fi

echo "✅ Sui CLI 已安装"

# 检查是否已配置测试网
if ! sui client envs | grep -q "testnet"; then
    echo "🌐 配置测试网环境..."
    sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
fi

echo "🔄 切换到测试网..."
sui client switch --env testnet

# 检查是否有地址
ADDRESSES=$(sui client addresses --json)
if [ "$ADDRESSES" == "[]" ]; then
    echo "🔑 创建新地址..."
    sui client new-address ed25519
fi

ACTIVE_ADDRESS=$(sui client active-address)
echo "📍 当前活跃地址: $ACTIVE_ADDRESS"

# 检查余额
echo "💰 检查余额..."
BALANCE=$(sui client balance --json | jq -r '.totalBalance // 0')
echo "当前余额: $BALANCE SUI"

if [ "$BALANCE" -lt 100000000 ]; then
    echo "💧 获取测试代币..."
    sui client faucet
    echo "⏳ 等待代币到账..."
    sleep 10
    
    NEW_BALANCE=$(sui client balance --json | jq -r '.totalBalance // 0')
    echo "新余额: $NEW_BALANCE SUI"
fi

echo "✅ Sui 环境设置完成！"
echo ""
echo "📋 环境信息:"
echo "网络: testnet"
echo "地址: $ACTIVE_ADDRESS"
echo "余额: $(sui client balance --json | jq -r '.totalBalance // 0') SUI"
echo ""
echo "🚀 现在可以运行部署脚本了:"
echo "./scripts/deploy.sh"