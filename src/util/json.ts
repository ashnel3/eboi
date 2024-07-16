import { readFile, writeFile } from 'fs/promises'

export const JSONRead = async <T>(path: string, defaultValue?: T): Promise<T> => {
  try {
    return JSON.parse((await readFile(path)).toString())
  } catch (error) {
    console.error(error)
    return defaultValue as T
  }
}

export const JSONWrite = async <T>(path: string, value: T): Promise<T> => {
  try {
    await writeFile(path, JSON.stringify(value, null, 2))
  } catch (error) {
    console.error(error)
  }
  return value
}

export default {
  read: JSONRead,
  write: JSONWrite,
}
