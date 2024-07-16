import type { TOptions } from 'i18next'

declare module 'i18next' {
  interface CustomTypeOptions {}

  interface CustomInstanceExtensions {
    tt: (key: string, options?: TOptions) => Record<string, string>
  }
}
