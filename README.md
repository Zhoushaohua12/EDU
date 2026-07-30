# 课径 · 人教版小学/初中学习站

按人教版/统编学段结构提供小学 1–6、初中 7–9 的科目导航。电子教材 PDF 来自开源仓库 [ChinaTextbook](https://github.com/Zhoushaohua12/ChinaTextbook)，并配有导学自测、账号登录与云端进度。

## 功能

- 首页品牌落地 + 小学 / 初中入口
- 年级 → 科目 → 上/下册教材 → 课时页
- 一键打开 / 下载 ChinaTextbook 中的人教、统编 PDF
- 导学自测（单选）与学习进度（`/me`）
- 管理员后台增改课时与题目（`/admin`）

## 技术栈

- Next.js（App Router）+ TypeScript
- Prisma + SQLite
- Auth.js（Credentials）
- 教材目录：`data/textbooks.json`（可由脚本从 GitHub 刷新）

## 快速开始

```bash
npm install
cp .env.example .env   # 若尚无 .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 刷新教材目录

当 ChinaTextbook 仓库更新后：

```bash
npm run catalog:build   # 从 GitHub API 重建 data/textbooks.json
npm run db:seed         # 按新目录重写课时与 PDF 链接
```

## 默认账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | `admin@kejing.local` | `admin123` |
| 学生 | `student@kejing.local` | `student123` |

## 常用命令

```bash
npm run dev            # 开发服务
npm run build          # 生产构建
npm run catalog:build  # 重建教材目录
npm run db:seed        # 写入种子数据
npm run db:reset       # 重置数据库并种子
```

## 环境变量

见 `.env.example`：

- `DATABASE_URL`：SQLite 路径，默认 `file:./dev.db`
- `AUTH_SECRET`：会话密钥（生产环境务必更换）
- `AUTH_TRUST_HOST`：本地/代理部署时设为 `true`

## 内容说明

- 目录优先收录人教版 / 统编版 PDF（小学语数英道法科美音体；初中语数英物化生史地道法）。
- 英语小学：1–2 年级用人教一年级起点，3–6 年级优先 PEP 三年级起点。
- 音乐优先简谱版。
- PDF 文件仍托管在 ChinaTextbook 仓库，本站保存导航链接与导学，不镜像整库大文件。
