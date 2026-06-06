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

export function generateSidebar(postsDir, baseUrl = '/posts') {
  function walk(dir, urlPrefix) {
    const result = []
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return result
    }

    // subdirectories first
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue

      const children = walk(join(dir, entry.name), `${urlPrefix}/${entry.name}`)
      if (children.length > 0) {
        result.push({
          text: entry.name,
          collapsed: false,
          items: children,
        })
      }
    }

    // then .md files (skip index.md)
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === 'index.md') continue

      const title = extractTitle(join(dir, entry.name))
      result.push({
        text: title,
        link: `${urlPrefix}/${basename(entry.name, '.md')}`,
      })
    }

    return result
  }

  return walk(postsDir, baseUrl)
}

export function getPosts(postsDir, baseUrl = '/posts') {
  const results = []

  function walk(dir, urlPrefix) {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue
        walk(join(dir, entry.name), `${urlPrefix}/${entry.name}`)
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
        results.push({
          title: extractTitle(join(dir, entry.name)),
          url: `${urlPrefix}/${basename(entry.name, '.md')}`,
        })
      }
    }
  }

  walk(postsDir, baseUrl)
  return results
}
