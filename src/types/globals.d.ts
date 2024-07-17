import type { TOptions } from 'i18next'
import type { EboiLogMessage } from '../util/logger.js'

declare module 'i18next' {
  interface CustomTypeOptions {}

  interface CustomInstanceExtensions {
    tt: (key: string, options?: TOptions) => Record<string, string>
  }
}

declare module 'winston' {
  interface LeveledLogMethod {
    (message: EboiLogMessage, callback: LogCallback): Logger
    (message: EboiLogMessage, meta: any, callback: LogCallback): Logger
    (message: EboiLogMessage, ...meta: any[]): Logger
    (message: EboiLogMessage): Logger
  }
}
