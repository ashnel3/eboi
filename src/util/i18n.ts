import { readdir } from 'fs/promises'
import i18next from 'i18next'
import i18nextFsBackend, { type FsBackendOptions } from 'i18next-fs-backend'
import { join } from 'path'

/** locales directory */
export const locales = join(import.meta.dirname, '../config/locale')
/** supported languages */
export const languages = (await readdir(locales)).map((f) => f.replace(/\..+$/, ''))

/** i18next instance */
const instance = await i18next.use(i18nextFsBackend).init<FsBackendOptions>({
  debug: false,
  fallbackLng: false,
  preload: languages,
  lng: 'en-US',
  backend: {
    loadPath: join(locales, '{{lng}}.json'),
  },
})

/**
 * create translation record
 * @param key        translation path
 * @param options    tfunc options
 * @returns          dict of languages & translations
 */
i18next.tt = (key, options) => {
  return languages.reduce(
    (acc: Record<string, string>, lng) => ({ ...acc, [lng]: i18next.t(key, { ...options, lng }) }),
    {},
  )
}

export default instance
