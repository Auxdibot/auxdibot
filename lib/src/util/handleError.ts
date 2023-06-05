import { Auxdibot } from '@/interfaces/Auxdibot';
import { BaseInteraction } from 'discord.js';

export default async function handleError(
   auxdibot: Auxdibot,
   error: string,
   error_message: string,
   interaction: BaseInteraction,
) {
   const errorEmbed = auxdibot.embeds.error
      .setAuthor({ name: `Error code: ${error}` })
      .setDescription(`An error occurred preforming this action!\n\n${error_message}`)
      .setFooter({ text: 'Found a bug? Join the Auxdibot support server and report it!' });
   interaction.isRepliable()
      ? interaction.reply({ embeds: [errorEmbed] })
      : interaction.channel.send({ embeds: [errorEmbed] });
}
