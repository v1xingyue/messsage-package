# 🚀 部署指南

这是一个完整的 Sui Move 合约部署指南，包含自动化脚本和手动部署步骤。

## 📋 前置条件

### 1. 系统要求
- Node.js 18+ 
- npm 或 yarn
- jq (JSON 处理工具)
- curl

### 2. 安装 Sui CLI

#### macOS
```bash
brew install sui
```

#### Linux/WSL
```bash
curl -fLJO https://github.com/MystenLabs/sui/releases/latest/download/sui-ubuntu-x86_64.tgz
tar -xzf sui-ubuntu-x86_64.tgz
sudo mv sui /usr/local/bin/
```

#### 从源码编译
```bash
git clone https://github.com/MystenLabs/sui.git
cd sui
cargo build --release --bin sui
```

### 3. 安装 jq (JSON 处理)
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# CentOS/RHEL
sudo yum install jq
```

## 🎯 快速部署 (推荐)

### 1. 一键设置环境
```bash
npm run setup-sui
```

这个脚本会自动：
- ✅ 检查 Sui CLI 安装
- ✅ 配置测试网环境
- ✅ 创建钱包地址
- ✅ 获取测试代币

### 2. 测试合约 (可选)
```bash
npm run test-contract
```

### 3. 部署合约
```bash
# 部署到测试网
npm run deploy:testnet

# 或使用默认命令
npm run deploy
```

### 4. 验证部署
```bash
npm run verify
```

### 5. 启动应用
```bash
npm run dev
```

## 🔧 手动部署步骤

如果你想了解详细的部署过程或需要自定义配置：

### 1. 配置 Sui 客户端

```bash
# 创建测试网环境
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443

# 切换到测试网
sui client switch --env testnet

# 创建新地址
sui client new-address ed25519

# 查看当前地址
sui client active-address
```

### 2. 获取测试代币

```bash
# 获取测试 SUI 代币
sui client faucet

# 检查余额
sui client balance
```

### 3. 构建和部署合约

```bash
# 进入合约目录
cd move

# 构建合约
sui move build

# 部署合约
sui client publish --gas-budget 100000000 --json
```

### 4. 记录部署信息

部署成功后，你会看到类似的输出：

```json
{
  "digest": "...",
  "objectChanges": [
    {
      "type": "published",
      "packageId": "0x...",
      ...
    },
    {
      "type": "created",
      "objectType": "...::PublicKeyRegistry",
      "objectId": "0x...",
      ...
    },
    {
      "type": "created", 
      "objectType": "...::MessageStorage",
      "objectId": "0x...",
      ...
    }
  ]
}
```

记录以下重要信息：
- **Package ID**: 合约包 ID
- **Registry Object ID**: PublicKeyRegistry 对象 ID
- **Storage Object ID**: MessageStorage 对象 ID

### 5. 更新环境变量

创建或更新 `.env` 文件：

```env
# Sui Network Configuration
VITE_SUI_NETWORK=testnet

# Contract Configuration
VITE_SUI_PACKAGE_ID=0x[YOUR_PACKAGE_ID]
VITE_REGISTRY_OBJECT_ID=0x[YOUR_REGISTRY_OBJECT_ID]
VITE_STORAGE_OBJECT_ID=0x[YOUR_STORAGE_OBJECT_ID]
```

## 🌐 多网络部署

### 测试网 (Testnet) - 推荐
```bash
npm run deploy:testnet
```
- 免费测试代币
- 稳定的测试环境
- 适合开发和测试

### 开发网 (Devnet)
```bash
npm run deploy:devnet
```
- 最新功能
- 可能不稳定
- 适合实验性功能

### 主网 (Mainnet)
```bash
npm run deploy:mainnet
```
- 生产环境
- 需要真实 SUI 代币
- 谨慎使用

## 📊 部署验证

### 自动验证
```bash
npm run verify
```

### 手动验证

1. **检查合约对象**
```bash
sui client object [PACKAGE_ID]
sui client object [REGISTRY_OBJECT_ID]
sui client object [STORAGE_OBJECT_ID]
```

2. **测试合约功能**
```bash
# 在应用中连接钱包
# 尝试注册公钥
# 发送测试消息
```

3. **查看区块链浏览器**
- 测试网: https://suiexplorer.com/?network=testnet
- 开发网: https://suiexplorer.com/?network=devnet
- 主网: https://suiexplorer.com/?network=mainnet

## 🔍 故障排除

### 常见错误及解决方案

#### 1. Sui CLI 未安装
```
❌ Sui CLI 未安装
```
**解决方案**: 按照前置条件安装 Sui CLI

#### 2. 余额不足
```
❌ 余额不足，无法部署
```
**解决方案**: 
```bash
sui client faucet  # 测试网/开发网
# 主网需要购买真实 SUI 代币
```

#### 3. 网络连接问题
```
❌ 网络连接超时
```
**解决方案**:
- 检查网络连接
- 尝试不同的 RPC 端点
- 使用 VPN (如果在某些地区)

#### 4. 合约编译错误
```
❌ 合约构建失败
```
**解决方案**:
- 检查 Move.toml 配置
- 确认依赖版本
- 查看错误日志

#### 5. Gas 费用不足
```
❌ Gas budget exceeded
```
**解决方案**:
```bash
# 增加 gas budget
sui client publish --gas-budget 200000000
```

#### 6. 对象 ID 提取失败
```
⚠️ 无法提取 Package ID
```
**解决方案**:
- 检查部署输出格式
- 手动从部署日志中提取 ID
- 重新部署合约

### 调试技巧

1. **查看详细日志**
```bash
# 启用详细输出
sui client publish --gas-budget 100000000 --json | jq '.'
```

2. **检查对象状态**
```bash
sui client object [OBJECT_ID] --json
```

3. **查看交易详情**
```bash
sui client transaction [DIGEST]
```

4. **监控 gas 使用**
```bash
sui client balance
```

## 📁 文件结构

部署后的项目结构：

```
├── .env                    # 环境变量 (包含合约地址)
├── .env.backup.*          # 环境变量备份
├── deployments/           # 部署记录
│   └── deploy-*.json     # 部署详情
├── scripts/              # 部署脚本
├── move/                 # Move 合约
└── src/                  # React 应用
```

## 🔄 重新部署

如果需要重新部署合约：

1. **备份当前配置**
```bash
cp .env .env.backup
```

2. **重新部署**
```bash
npm run deploy
```

3. **更新应用配置**
- 新的合约地址会自动更新到 `.env`
- 重启开发服务器: `npm run dev`

## 🚀 生产部署建议

### 主网部署前检查清单

- [ ] 在测试网充分测试
- [ ] 代码审计完成
- [ ] 准备足够的 SUI 代币
- [ ] 备份钱包助记词
- [ ] 设置监控和告警
- [ ] 准备应急响应计划

### 安全最佳实践

1. **使用专用部署钱包**
2. **限制钱包权限**
3. **定期轮换密钥**
4. **监控合约活动**
5. **保持代码更新**

## 📞 获取帮助

如果遇到问题：

1. **查看日志文件**
2. **运行验证脚本**: `npm run verify`
3. **检查网络状态**
4. **查阅 Sui 官方文档**
5. **在 GitHub 提交 Issue**

---

**提示**: 建议先在测试网部署和测试，确认一切正常后再部署到主网。