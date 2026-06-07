import { readdirSync, readFileSync } from 'fs'
import { join, basename } from 'path'

const SKIP_DIRS = new Set(['images', 'assets', 'public', '.vitepress', 'node_modules'])

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

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue
      const children = walk(join(d, entry.name), `${urlPrefix}/${entry.name}`, depth + 1)
      if (children.length > 0) {
        result.push({
          text: entry.name,
          collapsed,
          items: children,
        })
      }
    }
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === 'index.md') continue
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
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue
    if (!hasPosts(join(postsDir, entry.name))) continue
    items.push({ text: entry.name, link: `/posts/${entry.name}/` })
  }
  return items
}

/** sub-categories under a dir */
export function getSubCategories(catDir, baseUrl) {
  const items = []
  let entries
  try { entries = readdirSync(catDir, { withFileTypes: true }) } catch { return items }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue
    if (!hasPosts(join(catDir, entry.name))) continue
    items.push({ text: entry.name, link: `${baseUrl}/${entry.name}/` })
  }
  return items
}

/** posts directly under a dir (non-recursive) */
export function getDirectPosts(dir, baseUrl) {
  const items = []
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return items }
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === 'index.md') continue
    items.push({
      title: extractTitle(join(dir, entry.name)),
      url: `${baseUrl}/${basename(entry.name, '.md')}`,
    })
  }
  return items
}
