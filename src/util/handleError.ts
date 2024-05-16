import { Auxdibot } from '@/interfaces/Auxdibot';
import { BaseInteraction } from 'discord.js';

/**
 * Handles errors and sends an error embed message.
 * @param auxdibot - The instance of Auxdibot.
 * @param error - The error code.
 * @param error_message - The error message.
 * @param interaction - The interaction object.
 * @param ephemeral - Optional. Whether the error message should be ephemeral.
 */
export default async function handleError(
   auxdibot: Auxdibot,
   error: string,
   error_message: string,
   interaction: BaseInteraction,
   ephemeral?: boolean,
) {
   const errorEmbed = auxdibot.embeds.error
      .setAuthor({ name: `An error occurred!` })
      .setDescription(`${error_message}`)
      .setFooter({ text: `Error code: ${error}` });
   interaction.isRepliable() && interaction.deferred
      ? interaction.editReply({ embeds: [errorEmbed] })
      : interaction.isRepliable() && !interaction.replied
      ? auxdibot.createReply(interaction, { embeds: [errorEmbed], ephemeral: !!ephemeral })
      : interaction.channel.send({ embeds: [errorEmbed] });
}
