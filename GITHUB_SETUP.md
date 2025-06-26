# GitHub CI/CD 设置指南

## 📁 需要推送的文件

我已经为你创建了以下 CI/CD 相关文件，你需要手动推送到 GitHub：

### 1. GitHub Actions 工作流
```
.github/workflows/deploy-contract.yml
.github/workflows/test-contract.yml
```

### 2. 部署脚本
```
.github/scripts/setup-wallet.sh
.github/scripts/deploy-contract.sh
```

### 3. 文档
```
.github/DEPLOYMENT_GUIDE.md
deploy-contract.md
```

### 4. 本地部署脚本
```
scripts/deploy.sh
scripts/setup-sui.sh
```

## 🚀 推送步骤

### 1. 初始化 Git 仓库（如果还没有）
```bash
git init
git remote add origin https://github.com/your-username/your-repo.git
```

### 2. 添加所有文件
```bash
git add .
git commit -m "Add CI/CD configuration for Sui contract deployment"
```

### 3. 推送到 GitHub
```bash
git push -u origin main
```

## 🔧 GitHub 设置

### 1. 配置 Secrets

在 GitHub 仓库设置中添加以下 Secrets：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下 Secret：

**SUI_MNEMONIC**
- 名称: `SUI_MNEMONIC`
- 值: 你的钱包助记词（12或24个单词，用空格分隔）
- 示例: `word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12`

### 2. 创建环境（可选但推荐）

1. 进入 Settings → Environments
2. 创建以下环境：
   - `testnet`
   - `devnet` 
   - `mainnet`

3. 为 `mainnet` 环境设置保护规则：
   - Required reviewers: 添加需要审批的人员
   - Wait timer: 设置等待时间
   - Deployment branches: 限制为 `main` 分支

## 🎯 使用方法

### 自动触发
- **推送到 main/develop**: 自动部署到 testnet
- **创建 Pull Request**: 运行测试
- **修改 move/ 目录**: 触发相关工作流

### 手动触发
1. 进入 Actions 页面
2. 选择 "Deploy Sui Contract"
3. 点击 "Run workflow"
4. 选择网络和参数

## 📋 工作流功能

### Test Contract
- 代码格式检查
- 运行 Move 单元测试
- 生成测试覆盖率报告

### Deploy Contract
- 完整测试套件
- 部署到指定网络
- 生成部署报告
- 创建部署记录

## 🔍 验证设置

推送后，你可以：

1. 查看 Actions 页面是否显示工作流
2. 手动触发一次测试部署
3. 检查 Secrets 是否正确配置

## ⚠️ 重要提醒

1. **助记词安全**: 
   - 使用专门的部署钱包
   - 不要在主钱包中存储大量资产
   - 定期轮换助记词

2. **网络选择**:
   - 测试先在 testnet 进行
   - 主网部署需要真实的 SUI 代币

3. **Gas 费用**:
   - 确保钱包有足够余额
   - 测试网可以使用水龙头获取代币

## 📞 获取帮助

如果遇到问题：
1. 查看 GitHub Actions 日志
2. 检查 Secrets 配置
3. 验证助记词格式
4. 确认网络连接

推送完成后，你的 CI/CD 就设置好了！