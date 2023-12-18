import { Auxdibot } from '@/interfaces/Auxdibot';
import { BaseInteraction } from 'discord.js';

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
      ? interaction.reply({ embeds: [errorEmbed], ephemeral: !!ephemeral })
      : interaction.channel.send({ embeds: [errorEmbed] });
}
