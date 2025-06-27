# 匿名消息传输工具

一个基于 RSA 加密和 Sui 区块链的匿名消息传输工具。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 设置 Sui 环境

```bash
npm run setup-sui
```

这个脚本会：
- 检查 Sui CLI 安装状态
- 配置测试网环境
- 创建钱包地址
- 获取测试代币

### 3. 部署合约

```bash
# 部署到测试网（推荐）
npm run deploy:testnet

# 或者使用简化命令
npm run deploy
```

部署成功后，脚本会自动更新 `.env` 文件中的合约地址。

### 4. 验证部署

```bash
npm run verify
```

### 5. 启动应用

```bash
npm run dev
```

## 📋 可用脚本

| 脚本 | 描述 |
|------|------|
| `npm run setup-sui` | 设置 Sui 开发环境 |
| `npm run deploy` | 部署合约到测试网 |
| `npm run deploy:testnet` | 部署到测试网 |
| `npm run deploy:devnet` | 部署到开发网 |
| `npm run deploy:mainnet` | 部署到主网 |
| `npm run test-contract` | 运行合约测试 |
| `npm run verify` | 验证部署状态 |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |

## 🔧 部署流程

### 自动化部署

1. **环境设置**：
   ```bash
   npm run setup-sui
   ```

2. **合约测试**：
   ```bash
   npm run test-contract
   ```

3. **部署合约**：
   ```bash
   npm run deploy:testnet
   ```

4. **验证部署**：
   ```bash
   npm run verify
   ```

### 手动部署

如果你更喜欢手动控制每个步骤：

```bash
# 1. 设置环境
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet
sui client faucet

# 2. 构建和部署
cd move
sui move build
sui client publish --gas-budget 100000000

# 3. 更新 .env 文件中的合约地址
```

## 🌐 网络支持

- **测试网 (Testnet)** - 推荐用于开发和测试
- **开发网 (Devnet)** - 用于早期开发
- **主网 (Mainnet)** - 生产环境

## 📁 项目结构

```
├── scripts/                 # 部署和管理脚本
│   ├── setup-sui.sh        # Sui 环境设置
│   ├── deploy.sh           # 合约部署
│   ├── test-contract.sh    # 合约测试
│   └── verify-deployment.sh # 部署验证
├── move/                   # Sui Move 合约
│   ├── sources/            # 合约源码
│   └── tests/              # 合约测试
├── src/                    # React 应用
│   ├── components/         # UI 组件
│   ├── utils/              # 工具函数
│   └── types.ts            # 类型定义
├── deployments/            # 部署记录
└── .env                    # 环境变量
```

## 🔐 功能特性

### 本地功能
- 🔐 RSA-2048 密钥对生成和管理
- 🔒 端到端消息加密/解密
- 👥 公钥管理和联系人系统
- 🛡️ 主密码保护私钥
- 💾 本地数据存储

### 区块链集成
- ⛓️ Sui 区块链集成
- 📝 链上公钥注册
- 📨 链上消息存储
- 🔍 去中心化消息查询
- 👛 Sui 钱包连接

## 🛠️ 开发指南

### 添加新功能

1. 在 `src/components/` 中创建新组件
2. 在 `src/utils/` 中添加工具函数
3. 更新类型定义 `src/types.ts`
4. 如需链上功能，更新 Move 合约

### 合约开发

```bash
# 构建合约
cd move && sui move build

# 运行测试
sui move test

# 测试覆盖率
sui move test --coverage
```

## 🔍 故障排除

### 常见问题

1. **Sui CLI 未安装**
   ```bash
   # macOS
   brew install sui
   
   # Linux
   curl -fLJO https://github.com/MystenLabs/sui/releases/latest/download/sui-ubuntu-x86_64.tgz
   tar -xzf sui-ubuntu-x86_64.tgz
   sudo mv sui /usr/local/bin/
   ```

2. **余额不足**
   ```bash
   sui client faucet
   ```

3. **网络连接问题**
   - 检查网络连接
   - 尝试切换 RPC 端点
   - 重试部署命令

4. **合约地址错误**
   ```bash
   npm run verify
   ```

### 日志和调试

- 部署记录保存在 `deployments/` 目录
- 环境变量备份在 `.env.backup.*` 文件
- 使用 `npm run verify` 检查部署状态

## 🔗 有用链接

- [Sui 文档](https://docs.sui.io/)
- [Sui 浏览器 (测试网)](https://suiexplorer.com/?network=testnet)
- [Sui 水龙头 (测试网)](https://faucet.testnet.sui.io/)
- [Move 语言指南](https://move-language.github.io/move/)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 这是一个演示项目，请不要在生产环境中存储重要数据。