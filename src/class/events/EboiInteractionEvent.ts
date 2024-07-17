import { Collection, InteractionType } from 'discord.js'
import EboiEvent from '../EboiEvent.js'
import EboiErrorEmbed from '../embed/EboiErrorEmbed.js'
import { SECOND, EboiTimeout } from '../../util/time.js'

import type { ChatInputCommandInteraction, Interaction } from 'discord.js'
import type EboiShard from '../EboiShard.js'

export default class EboiInteractionEvent extends EboiEvent {
  private readonly _commandTimeouts = new Collection<string, EboiTimeout>()
  readonly name = 'interactionCreate'

  constructor(shard: EboiShard) {
    super(shard)
  }

  /**
   * Handle command timeouts
   * @param interaction  command interaction
   * @returns            passed timeout
   */
  async ApplicationCommandTimeout(interaction: ChatInputCommandInteraction): Promise<boolean> {
    const timeout = this._commandTimeouts.get(interaction.user.id)
    const passed = typeof timeout === 'undefined' || timeout.passed()
    if (!passed) {
      await new EboiErrorEmbed(this.shard, 'timeout!')
        .setDescription(`try again in \`≈${Math.ceil(timeout.remaining() / SECOND)}s\``)
        .send(interaction, { ephemeral: true })
    }
    return passed
  }

  /**
   * Handle running commands
   * @param interaction command interaction
   */
  async ApplicationCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this.shard._command.get(interaction.commandName)
    if (typeof command !== 'undefined') {
      try {
        this._commandTimeouts.set(interaction.user.id, EboiTimeout.ms(command.timeout))
        return await command.run(interaction)
      } catch (error) {
        this.logger.error({
          _ids: this.shard.ids,
          error: (error as Error).toString(),
          message: `failed to run command '${command.name}'!`,
        })
      }
    }
    await new EboiErrorEmbed(this.shard, 'command failed!').send(interaction, {
      ephemeral: true,
    })
  }

  async run(interaction: Interaction): Promise<void> {
    if (interaction.user.flags?.has('Spammer') || interaction.user.flags?.has('Quarantined')) {
      return
    }
    if (interaction.createdAt)
      switch (interaction.type) {
        case InteractionType.ApplicationCommand:
          if (await this.ApplicationCommandTimeout(interaction as any)) {
            await this.ApplicationCommand(interaction as any)
          }
          break
        default:
      }
  }
}
