import { Collection, InteractionType } from 'discord.js'
import EboiEvent from '../EboiEvent.js'
import { second } from '../../util/time.js'

import type { ChatInputCommandInteraction, Interaction } from 'discord.js'
import type EboiShard from '../EboiShard.js'
import EboiErrorEmbed from '../embed/EboiErrorEmbed.js'

export class EboiInteractionTimeout {
  readonly date: number

  constructor(length: number) {
    this.date = Date.now() + length
  }

  passed(): boolean {
    return this.date < Date.now()
  }

  remaining(): number {
    return this.date - Date.now()
  }
}

export default class EboiInteractionEvent extends EboiEvent {
  readonly _timeouts = new Collection<string, EboiInteractionTimeout>()
  readonly name = 'interactionCreate'

  constructor(shard: EboiShard) {
    super(shard)
  }

  /**
   * Handle application command
   * @param interaction command interaction
   */
  async ApplicationCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this.shard._command.get(interaction.commandName)
    const timeout = this._timeouts.get(interaction.user.id)
    // command timeout
    if (typeof timeout !== 'undefined' && !timeout.passed()) {
      await new EboiErrorEmbed(this.shard, 'timeout!')
        .setDescription(`try again in \`≈${Math.ceil(timeout.remaining() / second)}s\`!`)
        .send(interaction, { ephemeral: true })
      return
    }
    // command run
    if (typeof command !== 'undefined') {
      try {
        this._timeouts.set(interaction.user.id, new EboiInteractionTimeout(command.timeout))
        return await command.run(interaction)
      } catch (error) {
        this.logger.error({
          _ids: this.shard.ids,
          error: (error as Error).toString(),
          message: `failed to run command '${command.name}'!`,
        })
      }
    }
    await new EboiErrorEmbed(this.shard, 'failed to run command!').send(interaction, {
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
          return this.ApplicationCommand(interaction as any)
        default:
      }
  }
}
