import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setSuggestionsDiscussionThreads from '@/modules/features/suggestions/setSuggestionsDiscussionThreads';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

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
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }
      server.suggestions_discussion_threads = create_thread;
      setSuggestionsDiscussionThreads(auxdibot, interaction.guild, interaction.user, create_thread)
         .then(async () => {
            embed.description = `The suggestions auto deletion for this server has been changed.\r\n\r\nFormerly: ${
               discussionThreads ? 'Create Thread.' : 'Do not create a Thread.'
            }\r\n\r\nNow: ${create_thread ? 'Create Thread.' : 'Do not create a Thread.'}`;
            return await auxdibot.createReply(interaction, {
               embeds: [embed],
            });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'SUGGESTION_DISCUSSION_THREADS_SET_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the suggestions discussion threads!",
               interaction,
            );
         });
   },
};
