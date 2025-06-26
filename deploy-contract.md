# Sui 合约部署指南

## 前置条件

1. 安装 Sui CLI
2. 配置测试网环境
3. 获取测试代币

## 部署步骤

### 1. 安装 Sui CLI

```bash
# macOS
brew install sui

# 或者从源码编译
git clone https://github.com/MystenLabs/sui.git
cd sui
cargo build --release --bin sui
```

### 2. 配置 Sui 客户端

```bash
# 创建新的测试网环境
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443

# 切换到测试网
sui client switch --env testnet

# 创建新地址（如果没有的话）
sui client new-address ed25519

# 查看当前地址
sui client active-address
```

### 3. 获取测试代币

```bash
# 获取测试 SUI 代币
sui client faucet

# 检查余额
sui client balance
```

### 4. 构建和部署合约

```bash
# 进入合约目录
cd move

# 构建合约
sui move build

# 部署合约（需要足够的 gas）
sui client publish --gas-budget 100000000
```

### 5. 记录部署信息

部署成功后，您会看到类似以下的输出：

```
Transaction Digest: [DIGEST]
╭─────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Transaction Data                                                                                │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Sender: [YOUR_ADDRESS]                                                                          │
│ Gas Owner: [YOUR_ADDRESS]                                                                       │
│ Gas Budget: 100000000                                                                           │
│ Gas Price: 1000                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────────────────────╯

╭─────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Transaction Effects                                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Status: Success                                                                                 │
│ Created Objects:                                                                                │
│  ┌──                                                                                            │
│  │ ID: [PACKAGE_ID]                                                                            │
│  │ Owner: Immutable                                                                             │
│  │ Version: 1                                                                                   │
│  │ Digest: [DIGEST]                                                                            │
│  └──                                                                                            │
│  ┌──                                                                                            │
│  │ ID: [REGISTRY_OBJECT_ID]                                                                    │
│  │ Owner: Shared                                                                                │
│  │ Version: 1                                                                                   │
│  │ Digest: [DIGEST]                                                                            │
│  └──                                                                                            │
│  ┌──                                                                                            │
│  │ ID: [STORAGE_OBJECT_ID]                                                                     │
│  │ Owner: Shared                                                                                │
│  │ Version: 1                                                                                   │
│  │ Digest: [DIGEST]                                                                            │
│  └──                                                                                            │
╰─────────────────────────────────────────────────────────────────────────────────────────────────╯
```

请记录以下重要信息：
- **PACKAGE_ID**: 合约包 ID
- **REGISTRY_OBJECT_ID**: PublicKeyRegistry 对象 ID
- **STORAGE_OBJECT_ID**: MessageStorage 对象 ID

### 6. 更新环境变量

创建 `.env` 文件并填入部署信息：

```env
# Sui Network Configuration
VITE_SUI_NETWORK=testnet

# Contract Configuration
VITE_SUI_PACKAGE_ID=[YOUR_PACKAGE_ID]
VITE_REGISTRY_OBJECT_ID=[YOUR_REGISTRY_OBJECT_ID]
VITE_STORAGE_OBJECT_ID=[YOUR_STORAGE_OBJECT_ID]

# Optional: Custom RPC endpoint
# VITE_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
```

## 测试合约

### 运行合约测试

```bash
cd move
sui move test
```

### 验证部署

```bash
# 查看合约对象
sui client object [PACKAGE_ID]

# 查看共享对象
sui client object [REGISTRY_OBJECT_ID]
sui client object [STORAGE_OBJECT_ID]
```

## 常见问题

### 1. Gas 不足
如果遇到 gas 不足的错误，可以：
- 增加 gas budget: `--gas-budget 200000000`
- 获取更多测试代币: `sui client faucet`

### 2. 网络连接问题
如果连接超时，可以尝试：
- 切换 RPC 端点
- 检查网络连接
- 重试部署命令

### 3. 合约编译错误
检查：
- Move.toml 配置是否正确
- 依赖版本是否匹配
- 代码语法是否正确

## 部署后验证

1. 在应用中连接钱包
2. 查看"链上集成"页面是否显示"已连接"
3. 尝试注册公钥到链上
4. 发送测试消息

## 安全提醒

- 这是测试网部署，不要使用真实资产
- 保管好您的私钥和助记词
- 测试网数据可能会被重置