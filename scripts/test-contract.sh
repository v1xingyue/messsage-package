#!/bin/bash

# Sui 合约测试脚本
# 使用方法: ./scripts/test-contract.sh

set -e

echo "🧪 开始测试 Sui 合约..."

# 检查是否在正确的目录
if [ ! -d "move" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 进入合约目录
cd move

echo "📦 构建合约..."
if ! sui move build; then
    echo "❌ 合约构建失败"
    exit 1
fi

echo "🧪 运行单元测试..."
if sui move test; then
    echo "✅ 所有测试通过！"
else
    echo "❌ 测试失败"
    exit 1
fi

echo "🔍 运行测试覆盖率..."
sui move test --coverage

echo "📊 生成测试报告..."
if command -v sui &> /dev/null; then
    sui move coverage summary
fi

cd ..

echo ""
echo "✅ 合约测试完成！"
echo "📋 测试结果:"
echo "- 构建: ✅ 成功"
echo "- 单元测试: ✅ 通过"
echo "- 覆盖率: 📊 已生成"
echo ""
echo "🚀 现在可以部署合约了:"
echo "./scripts/deploy.sh"