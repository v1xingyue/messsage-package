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
    echo "Linux/WSL:"
    echo "  curl -fLJO https://github.com/MystenLabs/sui/releases/latest/download/sui-ubuntu-x86_64.tgz"
    echo "  tar -xzf sui-ubuntu-x86_64.tgz"
    echo "  sudo mv sui /usr/local/bin/"
    echo ""
    echo "从源码编译:"
    echo "  git clone https://github.com/MystenLabs/sui.git"
    echo "  cd sui"
    echo "  cargo build --release --bin sui"
    echo ""
    exit 1
fi

echo "✅ Sui CLI 已安装"
sui --version

# 检查是否已配置测试网
if ! sui client envs | grep -q "testnet"; then
    echo "🌐 配置测试网环境..."
    sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
fi

echo "🔄 切换到测试网..."
sui client switch --env testnet

# 检查是否有地址
ADDRESSES=$(sui client addresses --json 2>/dev/null || echo "[]")
if [ "$ADDRESSES" == "[]" ] || [ -z "$ADDRESSES" ]; then
    echo "🔑 创建新地址..."
    sui client new-address ed25519
fi

ACTIVE_ADDRESS=$(sui client active-address)
echo "📍 当前活跃地址: $ACTIVE_ADDRESS"

# 检查余额
echo "💰 检查余额..."
BALANCE_OUTPUT=$(sui client balance --json 2>/dev/null || echo '{"totalBalance": "0"}')
BALANCE=$(echo $BALANCE_OUTPUT | jq -r '.totalBalance // "0"' 2>/dev/null || echo "0")
echo "当前余额: $BALANCE SUI"

# 转换为数字进行比较
BALANCE_NUM=$(echo $BALANCE | sed 's/[^0-9]//g')
if [ -z "$BALANCE_NUM" ] || [ "$BALANCE_NUM" -lt 100000000 ]; then
    echo "💧 获取测试代币..."
    sui client faucet
    echo "⏳ 等待代币到账..."
    sleep 10
    
    NEW_BALANCE_OUTPUT=$(sui client balance --json 2>/dev/null || echo '{"totalBalance": "0"}')
    NEW_BALANCE=$(echo $NEW_BALANCE_OUTPUT | jq -r '.totalBalance // "0"' 2>/dev/null || echo "0")
    echo "新余额: $NEW_BALANCE SUI"
fi

echo "✅ Sui 环境设置完成！"
echo ""
echo "📋 环境信息:"
echo "网络: testnet"
echo "地址: $ACTIVE_ADDRESS"
FINAL_BALANCE_OUTPUT=$(sui client balance --json 2>/dev/null || echo '{"totalBalance": "0"}')
FINAL_BALANCE=$(echo $FINAL_BALANCE_OUTPUT | jq -r '.totalBalance // "0"' 2>/dev/null || echo "0")
echo "余额: $FINAL_BALANCE SUI"
echo ""
echo "🚀 现在可以运行部署脚本了:"
echo "./scripts/deploy.sh"