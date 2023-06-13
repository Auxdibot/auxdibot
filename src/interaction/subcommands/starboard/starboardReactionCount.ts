import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';

export const starboardReactionCount = <AuxdibotSubcommand>{
   name: 'reaction_count',
   info: {
      module: Modules['Starboard'],
      description: 'Set the starboard reaction count for this server.',
      usageExample: '/starboard reaction_count (reaction_count)',
      permission: 'starboard.settings.reaction_count',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const reaction_count = interaction.options.getNumber('reaction_count', true);
      if (reaction_count <= 0) {
         return await handleError(
            auxdibot,
            'REACTION_COUNT_INVALID',
            'The reaction count cannot be negative or zero!',
            interaction,
         );
      }
      if (server.starboard_reaction_count == reaction_count) {
         return await handleError(
            auxdibot,
            'REACTION_COUNT_INDENTICAL',
            'The reaction count specified is the same as the current starboard reaction count!',
            interaction,
         );
      }
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { starboard_reaction_count: reaction_count },
      });
      await handleLog(auxdibot, interaction.data.guild, {
         type: LogAction.STARBOARD_REACTION_COUNT_CHANGED,
         userID: interaction.data.member.id,
         date_unix: Date.now(),
         description: `The starboard reaction count for this server has been set to ${reaction_count}.`,
      });
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.description = `Set ${reaction_count} as the starboard reaction count. When a message is reacted with the starboard reaction ${reaction_count} times, it will be added to the starboard.`;
      return await interaction.reply({ embeds: [successEmbed] });
   },
};
