import { Client, Collection, Routes } from 'discord.js'
import logger from '../util/logger.js'
import load from '../util/loader.js'
import { join } from 'path'

import type { ClientEvents } from 'discord.js'
import type EboiEvent from './EboiEvent.js'
import { type EboiManagerMessageMap, EboiManagerMessageType } from './EboiManager.js'
import type { EboiEnvironment, EboiEnvironmentAuth } from '../types'

export default class EboiShard {
  readonly _events = new Collection<keyof ClientEvents, EboiEvent>()
  readonly _command = new Collection()
  readonly client = new Client({
    intents: [],
    partials: [],
    presence: {
      activities: [{ name: 'Loading...' }],
      status: 'dnd',
    },
  })
  readonly ids = this.client.shard?.ids ?? []
  readonly logger = logger
  readonly env!: EboiEnvironment

  constructor() {
    process.on('message', async (message: EboiManagerMessageMap[EboiManagerMessageType]) => {
      switch (message.type) {
        case EboiManagerMessageType.Exit:
          return await this.destroy()
        case EboiManagerMessageType.Spawn:
          // @ts-expect-error - on spawn assignment
          return await this.login((this.env = message.env), message.register)
      }
    })
  }

  private async register(auth: EboiEnvironmentAuth): Promise<void> {
    if (typeof auth.DISCORD_GUILD_ID === 'string' && auth.DISCORD_GUILD_ID !== '') {
      await this.client.rest.put(
        Routes.applicationGuildCommands(auth.DISCORD_APPLICATION_ID, auth.DISCORD_GUILD_ID),
      )
    } else {
      await this.client.rest.put(Routes.applicationCommands(auth.DISCORD_APPLICATION_ID))
    }
  }

  private async login(env: EboiEnvironment, register: boolean): Promise<void> {
    await this.client.login(env.auth.DISCORD_TOKEN)
    if (register) {
      await this.register(env.auth)
    }
  }

  async setup(): Promise<this> {
    this.logger.info({
      _ids: this.ids,
      message: 'shard initializing',
    })
    const { results, errors } = await load(this, [
      join(import.meta.dirname, './events'),
      join(import.meta.dirname, './commands'),
    ])
    if (errors.length > 0) {
      this.logger.error({
        _ids: this.ids,
        message: `failed loading ${errors.length} component(s)`,
        meta: errors.map((err) => err.message),
      })
    }
    this.logger.info({
      _ids: this.ids,
      message: `finished loading ${results.length} component(s)`,
    })
    return this
  }

  async destroy(): Promise<void> {
    await this.client.destroy()
  }
}
