import EboiCommand from '../EboiCommand.js'

import type { CommandInteraction } from 'discord.js'
import type EboiShard from '../EboiShard.js'

export default class EboiPingCommand extends EboiCommand {
  constructor(shard: EboiShard) {
    super(shard, 'ping')
    this.slash.setDescription('show bot latency')
  }

  async run(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({
      ephemeral: true,
      content: `Pong! \`${Math.max(this.shard.client.ws.ping, 0)}ms\` :ping_pong:`,
    })
  }
}
