import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import emojiRegex from 'emoji-regex';

export const starboardReaction = <AuxdibotSubcommand>{
   name: 'reaction',
   info: {
      module: Modules['Starboard'],
      description: 'Set the starboard reaction for this server.',
      usageExample: '/starboard reaction (reaction)',
      permission: 'starboard.settings.reaction',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const reaction = interaction.options.getString('reaction', true);
      const regex = emojiRegex();
      const emojis = reaction.match(regex);
      const emoji =
         interaction.client.emojis.cache.find((i) => i.toString() == reaction) || (emojis != null ? emojis[0] : null);
      if (!emoji) {
         return await handleError(auxdibot, 'INVALID_REACTION', "This isn't a valid reaction!", interaction);
      }
      if (server.starboard_reaction == emoji) {
         return await handleError(
            auxdibot,
            'STARBOARD_REACTION_IDENTICAL',
            'The reaction specified is the same as the current starboard reaction!',
            interaction,
         );
      }
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { starboard_reaction: typeof emoji == 'string' ? emoji : emoji.toString() },
      });
      await handleLog(auxdibot, interaction.data.guild, {
         type: LogAction.STARBOARD_REACTION_CHANGED,
         userID: interaction.data.member.id,
         date_unix: Date.now(),
         description: `The starboard reaction for this server has been set to ${emoji}.`,
      });
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.description = `Set ${emoji} as the starboard reaction.`;
      return await interaction.reply({ embeds: [successEmbed] });
   },
};
