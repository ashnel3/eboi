import EboiEvent from '../EboiEvent.js'
import type EboiShard from '../EboiShard.js'

export default class EboiReadyEvent extends EboiEvent {
  readonly name = 'ready'

  constructor(shard: EboiShard) {
    super(shard)
  }

  async run(): Promise<void> {
    const { username, id } = this.shard.client.user!
    this.logger.info({
      _ids: this.shard.ids,
      message: `shard logged-in as '${username}#${id}'!`,
    })
  }
}
