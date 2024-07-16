import { SlashCommandBuilder } from 'discord.js'
import { Logger } from 'winston'

import type { CommandInteraction } from 'discord.js'
import type EboiShard from './EboiShard.js'

export default abstract class EboiCommand {
  readonly logger: Logger
  readonly slash: SlashCommandBuilder

  constructor(
    readonly shard: EboiShard,
    readonly name: string,
  ) {
    this.slash = new SlashCommandBuilder().setName(name)
    this.logger = shard.logger
  }

  abstract run(interaction: CommandInteraction): Promise<void>
}
