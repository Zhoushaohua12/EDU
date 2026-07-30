# 课径 · 人教版小学/初中学习站

按人教版学段结构提供小学 1–6、初中 7–9 的科目导学与随堂练习。支持账号登录、云端学习进度与简易内容管理。

> 课时内容为原创导学与练习，**不收录教材课文原文**。

## 功能

- 首页品牌落地 + 小学 / 初中入口
- 年级 → 科目 → 单元 → 课时浏览
- 课时导学 + 单选/填空练习（即时判分）
- 注册登录后保存进度（`/me`）
- 管理员后台增改课时与题目（`/admin`）

## 技术栈

- Next.js（App Router）+ TypeScript
- Prisma + SQLite
- Auth.js（Credentials）

## 快速开始

```bash
npm install
cp .env.example .env   # 若尚无 .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 默认账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | `admin@kejing.local` | `admin123` |
| 学生 | `student@kejing.local` | `student123` |

## 常用命令

```bash
npm run dev          # 开发服务
npm run build        # 生产构建
npm run db:seed      # 重新写入种子数据
npm run db:reset     # 重置数据库并种子
```

## 环境变量

见 `.env.example`：

- `DATABASE_URL`：SQLite 路径，默认 `file:./dev.db`
- `AUTH_SECRET`：会话密钥（生产环境务必更换）
- `AUTH_TRUST_HOST`：本地/代理部署时设为 `true`
