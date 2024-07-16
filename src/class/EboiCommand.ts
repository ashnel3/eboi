import { Logger } from 'winston'
import type EboiShard from './EboiShard.js'

export default abstract class EboiCommand {
  readonly logger: Logger

  constructor(readonly shard: EboiShard) {
    this.logger = shard.logger
  }

  abstract readonly name: string
  abstract run(): Promise<void>
}
