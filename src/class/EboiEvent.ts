import type { ClientEvents } from 'discord.js'
import type EboiShard from './EboiShard.js'
import type { Logger } from 'winston'

export default abstract class EboiEvent {
  readonly logger: Logger

  constructor(readonly shard: EboiShard) {
    this.logger = shard.logger
  }

  abstract readonly name: keyof ClientEvents
  abstract run(...args: any[]): Promise<void>
}
