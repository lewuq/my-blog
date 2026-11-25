# Zeller's Blog

记录嵌入式开发、Linux 学习与日常实践的个人技术博客，基于 VitePress、Vue 3 和 Markdown 构建。

[访问博客](https://lewuq.github.io/my-blog/)

## 页面与功能

- **首页**：个人介绍、主题分类、文章数量和选读笔记。
- **全部文章**：按分类筛选，按标题、摘要和主题关键词搜索，展示预计阅读时长。
- **分类与阅读页**：自动生成分类导航和侧边栏，提供面包屑、本页目录、上一篇与下一篇导航。
- **全文搜索**：使用 VitePress 本地搜索，无需额外搜索服务。
- **图片预览**：文章图片支持点击放大，可给图片添加 `no-zoom` 类关闭该功能。
- **响应式布局**：适配桌面、平板和手机，窄屏下调整卡片列数与页面间距。

## 日夜主题

| 模式 | 页面背景 | 主要文字 | 强调色 |
| --- | --- | --- | --- |
| 白天 | 柔和暖白 `#f6f7f2` | 深绿灰 `#293b31` | 低饱和绿色 `#486b50` |
| 夜晚 | 接近黑色的深绿灰 `#171e1a` | 浅灰绿 `#e2eadc` | 浅鼠尾草绿 `#b6cda8` |

夜晚保持深色背景，浅鼠尾草绿用于标题、按钮和其他强调元素。导航栏、卡片、代码块和图片预览遮罩随主题切换。代码高亮分别使用 `github-light` 和 `github-dark`。

颜色集中定义在 `docs/.vitepress/theme/custom.css`：`:root` 对应白天，`html.dark` 对应夜晚。调整 `--blog-bg`、`--blog-surface`、`--blog-ink`、`--blog-muted`、`--blog-accent` 等变量即可统一更新页面配色。

## 本地运行

建议使用 Node.js 20，与当前 GitHub Actions 构建环境保持一致。

```bash
npm ci
npm run docs:dev
```

打开终端输出的地址，并保留 `/my-blog/` 路径，例如 `http://localhost:5173/my-blog/`。

生成生产文件并预览：

```bash
npm run docs:build
npm run docs:preview
```

构建产物位于 `docs/.vitepress/dist/`。`npm test` 目前仍是占位脚本；页面修改使用 `npm run docs:build` 检查构建结果。

## 项目结构

```text
docs/
├── index.md                      # 首页入口
├── index.data.js                 # 首页与归档共用的文章、分类数据
├── posts.md                      # 全部文章入口
├── posts.data.js                 # 复用文章数据加载器
├── posts/                        # 按分类组织的 Markdown 文章和图片
├── public/                       # Logo 等静态资源
└── .vitepress/
    ├── config.mjs                # 站点、导航、搜索与代码高亮配置
    ├── posts.mjs                 # 分类、文章元数据及侧边栏生成
    └── theme/
        ├── index.js              # 主题入口、组件注册与图片缩放
        ├── custom.css            # 日夜主题变量、排版与响应式规则
        └── components/
            ├── BlogHome.vue      # 首页介绍、分类入口与选读
            ├── PostArchive.vue   # 分类筛选、关键词搜索与空状态
            ├── PostCard.vue      # 首页与归档共用的文章卡片
            └── DocHeader.vue     # 阅读页标题与面包屑
scripts/
└── sync-notion.js                # Notion 文章与图片增量同步
.github/workflows/deploy.yml      # 同步、构建和 GitHub Pages 部署
```

文章摘要与预计阅读时长在构建时从 Markdown 内容中提取，不需要为每篇文章手动填写。`index.md` 作为分类入口，不计入文章列表。首页和归档使用同一份元数据，卡片组件共用，避免重复维护。

## 添加与整理文章

在 `docs/posts/` 下按分类放置文章，例如 `docs/posts/mcu/esp32/my-note.md`：

```markdown
---
title: "我的 ESP32 开发笔记"
category: "MCU"
subCategory: "ESP32"
---

在这里写一段介绍，说明这篇笔记记录的问题和实践过程。

## 开发环境

文章正文……
```

图片可放在同目录的 `images/` 下，并通过 `./images/example.png` 引用。每个分类目录使用 `index.md` 作为入口；手动新增分类时，可参考已有目录的 `index.md` 和 `index.data.js`。

分类显示名称在 `docs/.vitepress/posts.mjs` 的 `CATEGORY_LABELS` 中设置；分类与系列文章的顺序分别通过 `CATEGORY_ORDER` 和 `POST_ORDER` 调整。首页选读条目在 `BlogHome.vue` 的 `picks` 中配置。

组件内的站内链接使用 VitePress 的 `withBase()`，兼容当前 GitHub Pages 的 `/my-blog/` 部署路径。

## Notion 同步

同步脚本使用以下环境变量：

| 变量 | 用途 |
| --- | --- |
| `NOTION_TOKEN` | 具有目标数据库访问权限的 Notion 集成令牌 |
| `DATABASE_ID` | 用于发布文章的 Notion 数据库 ID |

在本地配置好环境变量后运行：

```bash
node scripts/sync-notion.js
```

数据库使用 `Published` 复选框控制发布，`标题`、`Category`、`SubCategory`、`SubSubCategory` 和 `Slug` 提供文章标题、分类路径及文件名；其中 `Slug` 必须填写。同步脚本会下载文章图片、为新目录生成分类入口，并通过 `scripts/.sync-meta.json` 记录增量同步状态。

脚本还会清理同步记录中已不在已发布结果里的文章。运行前应确认数据库与 `Published` 状态正确，令牌使用环境变量或 GitHub Secrets 配置。

## GitHub Pages 部署

当前工作流在以下情况运行：

- 推送到 `main` 分支。
- 在 GitHub Actions 中手动触发。
- 每周一 UTC 02:00（北京时间 10:00）定时运行。

工作流依次执行依赖安装、Notion 同步和 VitePress 构建，再将 `docs/.vitepress/dist/` 发布到 `gh-pages` 分支。

仓库需配置 `NOTION_TOKEN`、`DATABASE_ID` 两个 Actions Secrets，并在 GitHub Pages 设置中选择 `gh-pages` 分支的根目录。推送后可在仓库的 Actions 页面查看同步、构建与部署结果。

如果修改仓库名或部署到独立域名，请同时检查 `config.mjs` 中的 `base` 和 favicon 地址。
