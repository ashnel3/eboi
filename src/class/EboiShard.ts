import { Client, Routes } from 'discord.js'
import logger from '../util/logger.js'

import { type EboiManagerMessageMap, EboiManagerMessageType } from './EboiManager'
import { EboiEnvironment, EboiEnvironmentAuth } from 'src/types'

export default class EboiShard {
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
      ids: this.ids,
      message: 'Starting shard setup',
    })
    return this
  }

  async destroy(): Promise<void> {
    await this.client.destroy()
  }
}
