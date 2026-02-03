import path from 'path'
import { promises as fs } from 'fs'

let storageRoot = process.env.STORAGE_PATH
  ? path.resolve(process.cwd(), process.env.STORAGE_PATH)
  : path.resolve(process.cwd(), 'storage')

export function setStorageRoot(customRoot: string) {
  storageRoot = path.resolve(customRoot)
}

export async function ensureStorage() {
  await fs.mkdir(storageRoot, { recursive: true })
}

export async function writeStorage(relPath: string, content: string | Buffer) {
  const fullPath = path.join(storageRoot, relPath)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.writeFile(fullPath, content)
}

export async function appendStorage(relPath: string, data: any) {
  const fullPath = path.join(storageRoot, relPath)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  let arr: any[] = []
  try {
    const existing = await fs.readFile(fullPath, 'utf8')
    arr = JSON.parse(existing)
  } catch {
    arr = []
  }
  arr.push(data)
  await fs.writeFile(fullPath, JSON.stringify(arr, null, 2))
}

export async function readStorage(relPath: string) {
  const fullPath = path.join(storageRoot, relPath)
  try {
    const content = await fs.readFile(fullPath, 'utf8')
    return content
  } catch {
    return null
  }
}

export async function readProfile(userId: string) {
  const filePath = path.join('profiles', String(userId) + '.json')
  const content = await readStorage(filePath)
  if (!content) return null
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[parsed.length - 1]
    }
    return parsed
  } catch {
    return null
  }
}

export default {
  setStorageRoot,
  ensureStorage,
  writeStorage,
  appendStorage,
  readStorage,
  readProfile
}
