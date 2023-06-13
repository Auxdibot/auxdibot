import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';

export const suggestionsAutoDelete = <AuxdibotSubcommand>{
   name: 'auto_delete',
   info: {
      module: Modules['Suggestions'],
      description: 'Set whether suggestions are deleted upon being approved, denied, or marked as added.',
      usageExample: '/suggestions auto_delete (true|false)',
      permission: 'suggestions.auto_delete',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const deleteBool = interaction.options.getBoolean('delete', true);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Suggestions Auto Delete Changed';
      const deleteSuggestions = server.suggestions_auto_delete;
      if (deleteBool == deleteSuggestions) {
         embed.description = `Nothing changed. Auto delete is the same as settings.`;
         return await interaction.reply({
            embeds: [embed],
         });
      }
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { suggestions_auto_delete: deleteBool },
      });
      embed.description = `The suggestions auto deletion for this server has been changed.\r\n\r\nFormerly: ${
         deleteSuggestions ? 'Delete' : 'Do not Delete'
      }\r\n\r\nNow: ${deleteBool ? 'Delete' : 'Do not Delete'}`;
      await handleLog(auxdibot, interaction.data.guild, {
         type: LogAction.SUGGESTIONS_AUTO_DELETE_CHANGED,
         userID: interaction.data.member.id,
         date_unix: Date.now(),
         description: `The suggestions auto deletion for this server has been changed. (Now: ${
            deleteBool ? 'Delete' : 'Do not Delete'
         })`,
      });
      return await interaction.reply({
         embeds: [embed],
      });
   },
};
