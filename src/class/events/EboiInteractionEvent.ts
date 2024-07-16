import { InteractionType } from 'discord.js'
import EboiEvent from '../EboiEvent.js'

import type { ChatInputCommandInteraction, Interaction } from 'discord.js'
import type EboiShard from '../EboiShard.js'

export default class EboiInteractionEvent extends EboiEvent {
  readonly name = 'interactionCreate'

  constructor(shard: EboiShard) {
    super(shard)
  }

  /**
   * Handle application command
   * @param interaction command interaction
   */
  async ApplicationCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const command = this.shard._command.get(interaction.commandName)
      if (typeof command !== 'undefined') {
        await command.run(interaction)
      } else {
        await interaction.reply({
          ephemeral: true,
          content: `failed to find command '${interaction.commandName}'!`,
        })
      }
    } catch (error) {
      this.logger.error({
        _ids: this.shard.ids,
        message: `failed to run command '${interaction.commandName}'!`,
        meta: {
          error: (error as Error).message,
          user: interaction.user.toString(),
        },
      })
    }
  }

  async run(interaction: Interaction): Promise<void> {
    if (interaction.user.flags?.has('Spammer') || interaction.user.flags?.has('Quarantined')) {
      return
    }
    switch (interaction.type) {
      case InteractionType.ApplicationCommand:
        return this.ApplicationCommand(interaction as any)
      default:
    }
  }
}
