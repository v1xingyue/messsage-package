#!/bin/bash

# 验证合约部署脚本
# 使用方法: ./scripts/verify-deployment.sh

set -e

echo "🔍 验证合约部署状态..."

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "❌ 未找到 .env 文件"
    echo "请先运行部署脚本: ./scripts/deploy.sh"
    exit 1
fi

# 读取环境变量
source .env

echo "📋 当前配置:"
echo "网络: $VITE_SUI_NETWORK"
echo "Package ID: $VITE_SUI_PACKAGE_ID"
echo "Registry Object ID: $VITE_REGISTRY_OBJECT_ID"
echo "Storage Object ID: $VITE_STORAGE_OBJECT_ID"

# 检查是否为占位符地址
if [ "$VITE_SUI_PACKAGE_ID" == "0x0" ] || [ "$VITE_SUI_PACKAGE_ID" == "0x1234567890abcdef1234567890abcdef12345678" ]; then
    echo "❌ 检测到占位符地址，请先部署合约"
    exit 1
fi

echo ""
echo "🔍 验证合约对象..."

# 验证 Package 对象
echo "验证 Package ID: $VITE_SUI_PACKAGE_ID"
if sui client object "$VITE_SUI_PACKAGE_ID" --json > /dev/null 2>&1; then
    echo "✅ Package 对象存在"
else
    echo "❌ Package 对象不存在或无法访问"
fi

# 验证 Registry 对象
echo "验证 Registry Object ID: $VITE_REGISTRY_OBJECT_ID"
if sui client object "$VITE_REGISTRY_OBJECT_ID" --json > /dev/null 2>&1; then
    echo "✅ Registry 对象存在"
else
    echo "❌ Registry 对象不存在或无法访问"
fi

# 验证 Storage 对象
echo "验证 Storage Object ID: $VITE_STORAGE_OBJECT_ID"
if sui client object "$VITE_STORAGE_OBJECT_ID" --json > /dev/null 2>&1; then
    echo "✅ Storage 对象存在"
else
    echo "❌ Storage 对象不存在或无法访问"
fi

echo ""
echo "🌐 网络连接测试..."

# 测试网络连接
NETWORK_URL="https://fullnode.$VITE_SUI_NETWORK.sui.io:443"
if curl -s --connect-timeout 5 "$NETWORK_URL" > /dev/null; then
    echo "✅ 网络连接正常: $NETWORK_URL"
else
    echo "⚠️  网络连接可能有问题: $NETWORK_URL"
fi

echo ""
echo "📊 获取合约统计信息..."

# 尝试获取合约统计
ACTIVE_ADDRESS=$(sui client active-address 2>/dev/null || echo "unknown")
echo "当前地址: $ACTIVE_ADDRESS"

echo ""
echo "✅ 验证完成！"
echo ""
echo "🎯 如果所有检查都通过，您可以:"
echo "1. 启动应用: npm run dev"
echo "2. 连接钱包并测试功能"
echo ""
echo "🔗 浏览器链接:"
if [ "$VITE_SUI_NETWORK" == "testnet" ]; then
    echo "Package: https://suiexplorer.com/object/$VITE_SUI_PACKAGE_ID?network=testnet"
    echo "Registry: https://suiexplorer.com/object/$VITE_REGISTRY_OBJECT_ID?network=testnet"
    echo "Storage: https://suiexplorer.com/object/$VITE_STORAGE_OBJECT_ID?network=testnet"
elif [ "$VITE_SUI_NETWORK" == "devnet" ]; then
    echo "Package: https://suiexplorer.com/object/$VITE_SUI_PACKAGE_ID?network=devnet"
    echo "Registry: https://suiexplorer.com/object/$VITE_REGISTRY_OBJECT_ID?network=devnet"
    echo "Storage: https://suiexplorer.com/object/$VITE_STORAGE_OBJECT_ID?network=devnet"
elif [ "$VITE_SUI_NETWORK" == "mainnet" ]; then
    echo "Package: https://suiexplorer.com/object/$VITE_SUI_PACKAGE_ID?network=mainnet"
    echo "Registry: https://suiexplorer.com/object/$VITE_REGISTRY_OBJECT_ID?network=mainnet"
    echo "Storage: https://suiexplorer.com/object/$VITE_STORAGE_OBJECT_ID?network=mainnet"
fi