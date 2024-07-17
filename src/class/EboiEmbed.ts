import { EmbedBuilder } from 'discord.js'

import type EboiShard from './EboiShard.js'
import type {
  APIEmbed,
  EmbedData,
  Interaction,
  InteractionReplyOptions,
  InteractionResponse,
} from 'discord.js'

export default class EboiEmbed extends EmbedBuilder {
  constructor(
    readonly shard: EboiShard,
    data?: EmbedData | APIEmbed,
  ) {
    super(data)
  }

  async send(
    interaction: Interaction,
    options?: Omit<InteractionReplyOptions, 'embeds'>,
  ): Promise<InteractionResponse<boolean> | undefined> {
    if (interaction.isRepliable()) {
      return await interaction.reply({
        ...options,
        embeds: [this],
      })
    }
  }
}
