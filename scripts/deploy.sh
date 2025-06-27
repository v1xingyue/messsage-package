#!/bin/bash

# Sui 合约部署脚本
# 使用方法: ./scripts/deploy.sh [network]
# 网络选项: testnet (默认), devnet, mainnet

set -e

# 默认网络
NETWORK=${1:-testnet}

echo "🚀 开始部署 Sui 合约到 $NETWORK..."

# 检查 Sui CLI 是否安装
if ! command -v sui &> /dev/null; then
    echo "❌ Sui CLI 未安装，请先运行: ./scripts/setup-sui.sh"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -d "move" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 检查 jq 是否安装
if ! command -v jq &> /dev/null; then
    echo "❌ jq 未安装，请安装 jq 来解析 JSON"
    echo "macOS: brew install jq"
    echo "Ubuntu: sudo apt-get install jq"
    exit 1
fi

# 切换到指定网络
echo "🌐 切换到 $NETWORK 网络..."
sui client switch --env $NETWORK

# 获取当前地址
ACTIVE_ADDRESS=$(sui client active-address)
echo "📍 部署地址: $ACTIVE_ADDRESS"

# 进入合约目录
cd move

echo "📦 构建合约..."
if ! sui move build; then
    echo "❌ 合约构建失败"
    exit 1
fi

echo "💰 检查余额..."
BALANCE_OUTPUT=$(sui client balance --json 2>/dev/null || echo '{"totalBalance": "0"}')
BALANCE=$(echo $BALANCE_OUTPUT | jq -r '.totalBalance // "0"' 2>/dev/null || echo "0")
echo "当前余额: $BALANCE SUI"

# 检查余额是否足够（需要至少 0.1 SUI）
BALANCE_NUM=$(echo $BALANCE | sed 's/[^0-9]//g')
if [ -z "$BALANCE_NUM" ] || [ "$BALANCE_NUM" -lt 100000000 ]; then
    if [ "$NETWORK" == "testnet" ] || [ "$NETWORK" == "devnet" ]; then
        echo "⚠️  余额不足，正在获取测试代币..."
        sui client faucet
        sleep 5
    else
        echo "❌ 余额不足，无法部署到主网"
        exit 1
    fi
fi

echo "🚀 部署合约..."
echo "使用 gas budget: 100000000 (0.1 SUI)"

# 部署合约并捕获输出
DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 --json 2>/dev/null)

if [ $? -ne 0 ] || [ -z "$DEPLOY_OUTPUT" ]; then
    echo "❌ 合约部署失败"
    echo "请检查:"
    echo "1. 网络连接是否正常"
    echo "2. 余额是否足够"
    echo "3. 合约代码是否正确"
    exit 1
fi

echo "✅ 合约部署成功！"

# 解析部署结果
echo "📋 解析部署结果..."

# 提取 Package ID
PACKAGE_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.type == "published") | .packageId' 2>/dev/null)

# 提取共享对象 ID
REGISTRY_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.objectType | contains("PublicKeyRegistry")) | .objectId' 2>/dev/null)
STORAGE_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.objectType | contains("MessageStorage")) | .objectId' 2>/dev/null)

# 获取交易摘要
DIGEST=$(echo $DEPLOY_OUTPUT | jq -r '.digest' 2>/dev/null)

echo ""
echo "🎉 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 部署信息:"
echo "网络: $NETWORK"
echo "部署地址: $ACTIVE_ADDRESS"
echo "交易摘要: $DIGEST"
echo ""
echo "📦 合约地址:"
echo "Package ID: $PACKAGE_ID"
echo "Registry Object ID: $REGISTRY_ID"
echo "Storage Object ID: $STORAGE_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 验证提取的 ID
if [ -z "$PACKAGE_ID" ] || [ "$PACKAGE_ID" == "null" ]; then
    echo "⚠️  警告: 无法提取 Package ID"
    PACKAGE_ID="0x0"
fi

if [ -z "$REGISTRY_ID" ] || [ "$REGISTRY_ID" == "null" ]; then
    echo "⚠️  警告: 无法提取 Registry Object ID"
    REGISTRY_ID="0x0"
fi

if [ -z "$STORAGE_ID" ] || [ "$STORAGE_ID" == "null" ]; then
    echo "⚠️  警告: 无法提取 Storage Object ID"
    STORAGE_ID="0x0"
fi

# 返回项目根目录
cd ..

# 创建或更新环境变量文件
echo "📝 更新环境变量文件..."

ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    # 备份现有文件
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%s)"
    echo "已备份现有 .env 文件"
fi

# 创建新的环境变量文件
cat > "$ENV_FILE" << EOF
# Sui Network Configuration
VITE_SUI_NETWORK=$NETWORK

# Contract Configuration (Deployed on $(date))
VITE_SUI_PACKAGE_ID=$PACKAGE_ID
VITE_REGISTRY_OBJECT_ID=$REGISTRY_ID
VITE_STORAGE_OBJECT_ID=$STORAGE_ID

# Deployment Info
# Deployed by: $ACTIVE_ADDRESS
# Transaction: $DIGEST
# Network: $NETWORK

# Optional: Custom RPC endpoint
# VITE_SUI_RPC_URL=https://fullnode.$NETWORK.sui.io:443
EOF

echo "✅ 环境变量已保存到 $ENV_FILE"

# 创建部署记录
DEPLOY_RECORD="deployments/deploy-$(date +%Y%m%d-%H%M%S).json"
mkdir -p deployments

cat > "$DEPLOY_RECORD" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "network": "$NETWORK",
  "deployer": "$ACTIVE_ADDRESS",
  "digest": "$DIGEST",
  "packageId": "$PACKAGE_ID",
  "registryObjectId": "$REGISTRY_ID",
  "storageObjectId": "$STORAGE_ID",
  "gasUsed": "100000000"
}
EOF

echo "📄 部署记录已保存到 $DEPLOY_RECORD"

echo ""
echo "🎯 下一步:"
echo "1. 启动开发服务器: npm run dev"
echo "2. 连接 Sui 钱包"
echo "3. 测试链上功能"
echo ""
echo "🔗 有用的链接:"
if [ "$NETWORK" == "testnet" ]; then
    echo "浏览器: https://suiexplorer.com/txblock/$DIGEST?network=testnet"
    echo "水龙头: https://faucet.testnet.sui.io/"
elif [ "$NETWORK" == "devnet" ]; then
    echo "浏览器: https://suiexplorer.com/txblock/$DIGEST?network=devnet"
    echo "水龙头: https://faucet.devnet.sui.io/"
elif [ "$NETWORK" == "mainnet" ]; then
    echo "浏览器: https://suiexplorer.com/txblock/$DIGEST?network=mainnet"
fi

echo ""
echo "🎉 部署完成！合约现在可以在应用中使用了。"