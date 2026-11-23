import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/** Fingerprint the checkout served by the local app. Evaluation files and tests cannot alter tracing. */
export function sourceHash() {
  const hash = createHash('sha256')
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (/\.(tsx?|css|json)$/.test(path) && !/\.test\.tsx?$/.test(path)) hash.update(path).update('\0').update(readFileSync(path)).update('\0')
    }
  }
  walk('src')
  return hash.digest('hex')
}
