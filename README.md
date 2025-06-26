# 匿名消息传输工具

一个基于 RSA 加密和 Sui 区块链的匿名消息传输工具。

## 功能特性

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

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **区块链**: Sui Move 智能合约
- **钱包**: @mysten/dapp-kit
- **加密**: Web Crypto API (RSA-OAEP)
- **构建工具**: Vite

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

### 3. 部署 Sui Move 合约

```bash
cd move
sui move build
sui client publish --gas-budget 100000000
```

部署成功后，更新 `.env` 文件中的合约地址。

### 4. 启动开发服务器

```bash
npm run dev
```

## 合约部署指南

### 1. 安装 Sui CLI

```bash
# macOS
brew install sui

# 或从源码编译
git clone https://github.com/MystenLabs/sui.git
cd sui
cargo build --release
```

### 2. 配置 Sui 客户端

```bash
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet
```

### 3. 获取测试代币

```bash
sui client faucet
```

### 4. 部署合约

```bash
cd move
sui move build
sui client publish --gas-budget 100000000
```

### 5. 记录合约信息

部署成功后，记录以下信息到 `.env` 文件：
- Package ID
- PublicKeyRegistry Object ID  
- MessageStorage Object ID

## 使用说明

### 1. 设置主密码
首次使用时设置主密码，用于保护您的私钥。

### 2. 连接 Sui 钱包
点击"连接钱包"按钮连接您的 Sui 钱包。

### 3. 生成密钥对
在"密钥管理"页面生成新的 RSA 密钥对。

### 4. 注册公钥到链上
生成密钥后，可以选择将公钥注册到 Sui 区块链上。

### 5. 添加联系人公钥
在"公钥列表"页面添加其他人的公钥。

### 6. 加密消息
选择接收者公钥，输入消息进行加密。可选择同时发送到链上。

### 7. 解密消息
粘贴加密消息进行解密。

## 安全特性

- 🔐 RSA-2048 端到端加密
- 🛡️ 主密码保护私钥
- 🔒 私钥本地存储，永不上传
- ⛓️ 区块链去中心化存储
- 🚫 零知识架构，服务器无法解密

## 项目结构

```
├── src/
│   ├── components/          # React 组件
│   ├── utils/              # 工具函数
│   │   ├── crypto.ts       # 加密工具
│   │   ├── storage.ts      # 存储工具
│   │   └── suiContract.ts  # 合约交互
│   └── types.ts            # 类型定义
├── move/                   # Sui Move 合约
│   ├── sources/            # 合约源码
│   └── tests/              # 合约测试
└── README.md
```

## 开发指南

### 添加新功能

1. 在 `src/components/` 中创建新组件
2. 在 `src/utils/` 中添加工具函数
3. 更新类型定义 `src/types.ts`
4. 如需链上功能，更新 Move 合约

### 测试合约

```bash
cd move
sui move test
```

### 构建生产版本

```bash
npm run build
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 支持

如有问题，请创建 Issue 或联系开发团队。