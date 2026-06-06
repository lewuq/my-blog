const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const path = require("path");
const https = require("https");

// ============================
// 配置区，填你自己的
// ============================
const NOTION_TOKEN = process.env.NOTION_TOKEN || "your token(local test)"; // 从环境变量读取，或直接填字符串（不推荐）
const DATABASE_ID  = process.env.DATABASE_ID  || "your token(local test)"; // 同上";
const DOCS_DIR     = path.join(__dirname, "../docs/posts");
// ============================

const notion = new Client({ auth: NOTION_TOKEN });
const n2m    = new NotionToMarkdown({ notionClient: notion });

// 中文分类名 → 英文文件夹名
const SLUG_MAP = {
  "MCU":          "mcu",
  "Linux学习笔记": "linux",
  "RTOS":         "rtos",
  "网络知识":      "network",
  "数据库":        "database",
  "随笔":          "essay",
  "Nordic":       "nordic",
  "STM32":        "stm32",
  "ESP32":        "esp32",
  "IMX6ULL":      "imx6ull",
  "Linux裸机学习": "linux-bare-metal",
};

function toSlug(str) {
  if (!str) return "";
  return (SLUG_MAP[str] || str)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

// 下载图片到本地
function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    try {
      const file = fs.createWriteStream(destPath);
      https.get(url, (res) => {
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(destPath); });
      }).on("error", () => resolve(null));
    } catch { resolve(null); }
  });
}

async function main() {
  console.log("🔄 开始同步 Notion 文章...");

  // 清空旧文章
  if (fs.existsSync(DOCS_DIR)) {
    fs.rmSync(DOCS_DIR, { recursive: true });
  }
  fs.mkdirSync(DOCS_DIR, { recursive: true });

  // 查询所有 Published=true 的文章
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: "Published",
      checkbox: { equals: true },
    },
  });

  console.log(`📄 找到 ${response.results.length} 篇文章`);

  for (const page of response.results) {
    const props = page.properties;

    // 读取属性
    const title          = props["标题"]?.title?.[0]?.plain_text || "untitled";
    const category       = props["Category"]?.select?.name || "";
    const subCategory    = props["SubCategory"]?.select?.name || "";
    const subSubCategory = props["SubSubCategory"]?.select?.name || "";
    const slug           = props["Slug"]?.rich_text?.[0]?.plain_text || "";

    if (!slug) {
      console.warn(`⚠️  跳过「${title}」：Slug 为空`);
      continue;
    }

    // 生成文件夹路径
    const parts = [
      toSlug(category),
      toSlug(subCategory),
      toSlug(subSubCategory),
    ].filter(Boolean);

    const dirPath  = path.join(DOCS_DIR, ...parts);
    const filePath = path.join(dirPath, `${slug}.md`);
    const imgDir   = path.join(dirPath, "images");

    fs.mkdirSync(dirPath, { recursive: true });

    // 转换内容
    const mdBlocks = await n2m.pageToMarkdown(page.id);
    let mdContent  = n2m.toMarkdownString(mdBlocks).parent;

    // 处理 Notion 图片（下载到本地，替换链接）
    // const imgRegex = /!\[([^\]]*)\]\((https:\/\/[^)]+notion[^)]+)\)/g;
    const imgRegex = /!\[([^\]]*)\]\((https:\/\/[^)]+)\)/g;
    const imgMatches = [...mdContent.matchAll(imgRegex)];

    if (imgMatches.length > 0) {
      fs.mkdirSync(imgDir, { recursive: true });
      for (const match of imgMatches) {
        const [fullMatch, alt, url] = match;
        const ext      = url.includes(".png") ? "png" : url.includes(".gif") ? "gif" : "jpg";
        const imgName  = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const imgPath  = path.join(imgDir, imgName);
        const saved    = await downloadImage(url, imgPath);
        if (saved) {
          // 替换为相对路径
          const relPath = `./images/${imgName}`;
          mdContent = mdContent.replace(fullMatch, `![${alt}](${relPath})`);
        }
      }
    }

    // 加上 frontmatter
    const frontmatter = `---
title: "${title}"
category: "${category}"
subCategory: "${subCategory}"
subSubCategory: "${subSubCategory}"
---

`;
    fs.writeFileSync(filePath, frontmatter + mdContent, "utf-8");
    console.log(`✅ ${title} → ${filePath}`);
  }

  console.log("🎉 同步完成！");
}

main().catch(console.error);