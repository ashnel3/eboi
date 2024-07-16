import type { EboiOptions } from './config'

export type EboiEnvironmentMode = 'development' | 'production'

export interface PackageJSON extends Record<string, unknown> {
  name: string
  description?: string
  version: string
}

export interface EboiEnvironmentAuth {
  DISCORD_APPLICATION_ID: string
  DISCORD_TOKEN: string
  DISCORD_OWNER_ID?: string
  DISCORD_GUILD_ID?: string
  DISCORD_GENERATE_INVITE: boolean
  EBAY_APPLICATION_ID: string
  EBAY_CLIENT_SECRET: string
}

export interface EboiEnvironment {
  auth: EboiEnvironmentAuth
  meta: PackageJSON
  mode: EboiEnvironmentMode
  options: EboiOptions
  root: string
  ts: boolean
}
