import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';

export const suggestionsDiscussionThreads = <AuxdibotSubcommand>{
   name: 'discussion_threads',
   info: {
      module: Modules['Suggestions'],
      description: 'Set whether a discussion thread is created when a suggestion is created.',
      usageExample: '/suggestions discussion_threads (true|false)',
      permission: 'suggestions.discussion_threads',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const create_thread = interaction.options.getBoolean('create_thread', true);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Suggestions Discussion Threads Changed';
      const discussionThreads = server.suggestions_discussion_threads;
      if (create_thread == discussionThreads) {
         embed.description = `Nothing changed. Auto delete is the same as settings.`;
         return await interaction.reply({
            embeds: [embed],
         });
      }
      server.suggestions_discussion_threads = create_thread;
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { suggestions_discussion_threads: create_thread },
      });
      embed.description = `The suggestions auto deletion for this server has been changed.\r\n\r\nFormerly: ${
         discussionThreads ? 'Create Thread.' : 'Do not create a Thread.'
      }\r\n\r\nNow: ${create_thread ? 'Create Thread.' : 'Do not create a Thread.'}`;
      await handleLog(auxdibot, interaction.data.guild, {
         type: LogAction.SUGGESTIONS_THREAD_CREATION_CHANGED,
         userID: interaction.data.member.id,
         date_unix: Date.now(),
         description: `The suggestions auto deletion for this server has been changed. (Now: ${
            create_thread ? 'Create Thread.' : 'Do not create a Thread.'
         })`,
      });
      return await interaction.reply({
         embeds: [embed],
      });
   },
};
