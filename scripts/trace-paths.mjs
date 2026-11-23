import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/** Old benchmark manifests name a Windows checkout. Resolve its repository-relative suffix without changing annotations. */
export function resolvePlanFile(file) {
  if (existsSync(file)) return file
  const normalized = file.replaceAll('\\', '/')
  const marker = normalized.indexOf('Demo drawings/')
  return resolve(process.env.TRACE_REPO ?? process.cwd(), marker < 0 ? normalized : normalized.slice(marker))
}
