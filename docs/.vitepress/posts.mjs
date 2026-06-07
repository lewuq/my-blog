import { readdirSync, readFileSync } from 'fs'
import { join, basename } from 'path'

const SKIP_DIRS = new Set(['images', 'assets', 'public', '.vitepress', 'node_modules'])

// 分类排序：排前面的显示在前，未列出的按字母排
const CATEGORY_ORDER = [
  'mcu',
  'linux',
  'linux-bare-metal',
  'rtos',
  'nordic',
  'stm32',
  'esp32',
  'imx6ull',
  'rk3588',
  'network',
  'database',
  'essay',
]

// 文章排序：按文件名（不含 .md），排前面的显示在前，未列出的按字母排
// key 是 posts/ 下的相对路径（用 / 分隔）
const POST_ORDER = {
  'linux/linux-bare-metal/imx6ull': [
    'bare-idx',
    'led-assembly',
    'led-c',
    'led-st',
    'bsp',
    'clock',
    'gpio-input',
    'gpio-interrupt',
    'epit',
  ],
}

function sortByOrder(entries) {
  const orderMap = new Map(CATEGORY_ORDER.map((name, i) => [name.toLowerCase(), i]))
  return entries.sort((a, b) => {
    const ai = orderMap.get(a.name.toLowerCase())
    const bi = orderMap.get(b.name.toLowerCase())
    if (ai !== undefined && bi !== undefined) return ai - bi
    if (ai !== undefined) return -1
    if (bi !== undefined) return 1
    return a.name.localeCompare(b.name)
  })
}

function sortPosts(entries, relDir) {
  const order = POST_ORDER[relDir]
  if (!order) {
    return entries.sort((a, b) => a.name.localeCompare(b.name))
  }
  const orderMap = new Map(order.map((name, i) => [name.toLowerCase(), i]))
  return entries.sort((a, b) => {
    const an = basename(a.name, '.md').toLowerCase()
    const bn = basename(b.name, '.md').toLowerCase()
    const ai = orderMap.get(an)
    const bi = orderMap.get(bn)
    if (ai !== undefined && bi !== undefined) return ai - bi
    if (ai !== undefined) return -1
    if (bi !== undefined) return 1
    return an.localeCompare(bn)
  })
}

function extractTitle(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(/^---\r?\n([\s\S]*?)\n---/)
  if (!match) return basename(filePath, '.md')
  const titleMatch = match[1].match(/^title:\s*["']?(.+?)["']?\s*$/m)
  return titleMatch ? titleMatch[1].trim() : basename(filePath, '.md')
}

function hasPosts(dir) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory() && !SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
        if (hasPosts(join(dir, entry.name))) return true
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
        return true
      }
    }
  } catch {}
  return false
}

/**
 * Recursively build sidebar tree.
 * @param {string} dir   — absolute dir path to scan
 * @param {string} baseUrl — URL prefix for links
 * @param {object} opts
 * @param {boolean} opts.collapsed — default collapsed state for directory groups
 */
export function generateSidebar(dir, baseUrl, opts = {}) {
  const { collapsed = false } = opts

  function walk(d, urlPrefix, depth) {
    const result = []
    let entries
    try { entries = readdirSync(d, { withFileTypes: true }) } catch { return result }

    // 目录按 CATEGORY_ORDER 排序
    const dirs = sortByOrder(entries.filter(e => e.isDirectory() && !SKIP_DIRS.has(e.name) && !e.name.startsWith('.')))
    for (const entry of dirs) {
      const children = walk(join(d, entry.name), `${urlPrefix}/${entry.name}`, depth + 1)
      if (children.length > 0) {
        result.push({
          text: entry.name,
          collapsed,
          items: children,
        })
      }
    }

    // 文件按 POST_ORDER 排序
    const files = entries.filter(e => e.isFile() && e.name.endsWith('.md') && e.name !== 'index.md')
    const relDir = urlPrefix.replace(/^\/posts\//, '')
    sortPosts(files, relDir)
    for (const entry of files) {
      result.push({
        text: extractTitle(join(d, entry.name)),
        link: `${urlPrefix}/${basename(entry.name, '.md')}`,
      })
    }

    return result
  }

  return walk(dir, baseUrl, 0)
}

/** flat list of all posts (for data loaders) */
export function getPosts(dir, baseUrl = '/posts') {
  const results = []

  function walk(d, urlPrefix) {
    let entries
    try { entries = readdirSync(d, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue
        walk(join(d, entry.name), `${urlPrefix}/${entry.name}`)
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
        results.push({
          title: extractTitle(join(d, entry.name)),
          url: `${urlPrefix}/${basename(entry.name, '.md')}`,
        })
      }
    }
  }

  walk(dir, baseUrl)
  return results
}

/** nav dropdown — top-level category dirs */
export function getCategoryNav(postsDir) {
  const items = []
  let entries
  try { entries = readdirSync(postsDir, { withFileTypes: true }) } catch { return items }

  const dirs = sortByOrder(entries.filter(e => e.isDirectory() && !SKIP_DIRS.has(e.name) && !e.name.startsWith('.') && hasPosts(join(postsDir, e.name))))
  for (const entry of dirs) {
    items.push({ text: entry.name, link: `/posts/${entry.name}/` })
  }
  return items
}

/** sub-categories under a dir */
export function getSubCategories(catDir, baseUrl) {
  const items = []
  let entries
  try { entries = readdirSync(catDir, { withFileTypes: true }) } catch { return items }

  const dirs = sortByOrder(entries.filter(e => e.isDirectory() && !SKIP_DIRS.has(e.name) && !e.name.startsWith('.') && hasPosts(join(catDir, e.name))))
  for (const entry of dirs) {
    items.push({ text: entry.name, link: `${baseUrl}/${entry.name}/` })
  }
  return items
}

/** posts directly under a dir (non-recursive) */
export function getDirectPosts(dir, baseUrl) {
  const items = []
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return items }

  const files = entries.filter(e => e.isFile() && e.name.endsWith('.md') && e.name !== 'index.md')
  const relDir = baseUrl.replace(/^\/posts\//, '')
  sortPosts(files, relDir)
  for (const entry of files) {
    items.push({
      title: extractTitle(join(dir, entry.name)),
      url: `${baseUrl}/${basename(entry.name, '.md')}`,
    })
  }
  return items
}
