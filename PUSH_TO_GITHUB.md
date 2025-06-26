# 如何推送到 GitHub

## 📋 当前状态
所有 CI/CD 文件已在本地创建，但还未推送到 GitHub。

## 🔄 推送步骤

### 方法一：直接推送（推荐）
```bash
# 1. 添加所有文件
git add .

# 2. 提交更改
git commit -m "Add CI/CD configuration for Sui contract deployment

- Add GitHub Actions workflows for testing and deployment
- Add deployment scripts for local and CI/CD use
- Add comprehensive documentation
- Configure multi-network deployment support"

# 3. 推送到 GitHub
git push origin main
```

### 方法二：分步推送
```bash
# 1. 先推送 GitHub Actions 配置
git add .github/
git commit -m "Add GitHub Actions workflows"
git push origin main

# 2. 再推送脚本文件
git add scripts/
git commit -m "Add deployment scripts"
git push origin main

# 3. 最后推送文档
git add *.md
git commit -m "Add deployment documentation"
git push origin main
```

## 🔧 推送后的设置

### 1. 配置 GitHub Secrets
进入仓库 Settings → Secrets and variables → Actions，添加：

**SUI_MNEMONIC**
```
your twelve word mnemonic phrase goes here like this example
```

### 2. 创建环境（可选）
- `testnet`
- `devnet` 
- `mainnet`

### 3. 测试工作流
1. 进入 Actions 页面
2. 手动触发 "Deploy Sui Contract"
3. 选择 testnet 进行测试

## ✅ 验证推送成功

推送后检查：
- [ ] `.github/workflows/` 目录在 GitHub 上可见
- [ ] Actions 页面显示工作流
- [ ] 可以手动触发部署
- [ ] Secrets 配置正确

## 🎯 下一步

推送成功后：
1. 配置钱包助记词 Secret
2. 测试部署到 testnet
3. 验证合约功能
4. 准备主网部署

## 📞 如需帮助

如果推送遇到问题：
1. 检查 Git 仓库状态：`git status`
2. 确认远程仓库：`git remote -v`
3. 检查分支：`git branch -a`