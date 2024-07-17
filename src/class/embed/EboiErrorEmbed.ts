import EboiEmbed from '../EboiEmbed.js'
import type EboiShard from '../EboiShard.js'

export default class EboiErrorEmbed extends EboiEmbed {
  constructor(shard: EboiShard, title: string) {
    super(shard)
    this.setColor(0xff0000)
      .setTitle('Error: ' + title)
      .setFooter({ text: `eboi v${shard.env.meta.version}` })
  }
}
