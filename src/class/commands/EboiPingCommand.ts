import EboiCommand from '../EboiCommand.js'
import type EboiShard from '../EboiShard.js'

export default class EboiPingCommand extends EboiCommand {
  readonly name = 'ping'

  constructor(shard: EboiShard) {
    super(shard)
  }

  async run(): Promise<void> {}
}
