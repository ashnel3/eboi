import { ShardingManager } from 'discord.js'
import { assertEnv } from '../util/assert.js'
import logger from '../util/logger.js'
import json from '../util/json.js'
import { join } from 'path'

import type { EboiEnvironment, EboiEnvironmentMode } from 'src/types/env.js'

export const enum EboiManagerMessageType {
  Exit = 0,
  Spawn,
}

export interface EboiManagerMessageMap {
  [EboiManagerMessageType.Exit]: {
    readonly type: EboiManagerMessageType.Exit
  }
  [EboiManagerMessageType.Spawn]: {
    readonly env: EboiEnvironment
    readonly register: boolean
    readonly type: EboiManagerMessageType.Spawn
  }
}

export default class EboiManager {
  readonly shards: ShardingManager
  readonly logger = logger

  static async createEnvironment(root: string): Promise<EboiEnvironment> {
    const { DISCORD_GUILD_ID, DISCORD_GENERATE_INVITE, DISCORD_OWNER_ID, NODE_ENV, TS_NODE } =
      process.env
    const mode: EboiEnvironmentMode = NODE_ENV === 'development' ? 'development' : 'production'
    return {
      auth: {
        DISCORD_APPLICATION_ID: assertEnv('DISCORD_APPLICATION_ID'),
        DISCORD_TOKEN: assertEnv('DISCORD_TOKEN'),
        EBAY_APPLICATION_ID: assertEnv('EBAY_APPLICATION_ID'),
        EBAY_CLIENT_SECRET: assertEnv('EBAY_CLIENT_SECRET'),
        DISCORD_GUILD_ID,
        DISCORD_GENERATE_INVITE: DISCORD_GENERATE_INVITE === 'true',
        DISCORD_OWNER_ID,
      },
      options: await json.read(join(root, 'config/options.json'), {}),
      meta: await json.read(join(root, '../package.json'), { name: 'eboi', version: '0.0.0' }),
      mode,
      root,
      ts: mode === 'development' && TS_NODE === 'true',
    }
  }

  constructor(readonly env: EboiEnvironment) {
    this.shards = new ShardingManager(join(env.root, env.ts ? 'shard.ts' : 'shard.js'), {
      execArgv: env.ts
        ? [
            '--import',
            'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));',
          ]
        : [],
      silent: env.mode === 'production',
      token: env.auth.DISCORD_TOKEN,
    })
    this.shards.on('shardCreate', (shard) => {
      shard
        .on('error', console.error)
        .on('message', console.log)
        .on('spawn', async () => {
          await shard.send({
            env: this.env,
            register: false,
            type: EboiManagerMessageType.Spawn,
          } satisfies EboiManagerMessageMap[EboiManagerMessageType.Spawn])
        })
    })
  }

  async setup(): Promise<void> {
    this.logger.info({
      _ids: ['main'],
      message: `starting eboi v${this.env.meta.version}`,
    })
    await this.shards.spawn({
      amount: 2, // TEMP
      timeout: 10e3,
    })
  }
}
