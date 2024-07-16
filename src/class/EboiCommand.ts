import { SlashCommandBuilder } from 'discord.js'
import i18next from 'i18next'

import type { Logger } from 'winston'
import type { CommandInteraction, Permissions } from 'discord.js'
import type EboiShard from './EboiShard.js'

export default abstract class EboiCommand {
  readonly logger: Logger
  readonly slash: SlashCommandBuilder

  constructor(
    readonly shard: EboiShard,
    readonly name: string,
    readonly permissions: Permissions | bigint | number = 0,
  ) {
    this.slash = new SlashCommandBuilder()
      .setName(name)
      .setNameLocalizations(i18next.tt('command.name.' + name))
      .setDescription(i18next.t('command.description.' + name))
      .setDescriptionLocalizations(i18next.tt('command.description.' + name))
      .setDefaultMemberPermissions(permissions)
    this.logger = shard.logger
  }

  abstract run(interaction: CommandInteraction): Promise<void>
}
