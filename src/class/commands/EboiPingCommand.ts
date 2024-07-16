import EboiCommand from '../EboiCommand.js'
import { PermissionFlagsBits } from 'discord.js'

import type { CommandInteraction } from 'discord.js'
import type EboiShard from '../EboiShard.js'

export default class EboiPingCommand extends EboiCommand {
  constructor(shard: EboiShard) {
    super(shard, 'ping', PermissionFlagsBits.ModerateMembers)
  }

  async run(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({
      content: `:ping_pong: \`${Math.max(this.shard.client.ws.ping, 0)}ms\``,
    })
  }
}
