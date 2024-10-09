import Modules from '@/constants/bot/commands/Modules';
import Limits from '@/constants/database/Limits';
import { DEFAULT_SUGGESTION_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createSuggestion from '@/modules/features/suggestions/createSuggestion';
import incrementSuggestionsTotal from '@/modules/features/suggestions/incrementSuggestionsTotal';
import handleError from '@/util/handleError';

import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction, Suggestion, SuggestionState } from '@prisma/client';

export const suggestionsCreate = <AuxdibotSubcommand>{
   name: 'create',
   info: {
      module: Modules['Suggestions'],
      description: 'Create a suggestion.',
      usageExample: '/suggestions create (suggestion)',
      allowedDefault: true,
      permissionsRequired: [],
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const content = interaction.options.getString('suggestion', true);
      const member = await auxdibot.database.servermembers.findFirst({
         where: { userID: interaction.data.member.id, serverID: interaction.data.guild.id },
      });
      if (member && member.suggestions_banned) {
         return await handleError(
            auxdibot,
            'SUGGESTIONS_BANNED',
            'You are banned from making suggestions on this server!',
            interaction,
         );
      }
      const suggestions_channel = server.suggestions_channel
         ? await interaction.data.guild.channels.fetch(server.suggestions_channel).catch(() => undefined)
         : undefined;
      if (!suggestions_channel || !suggestions_channel.isTextBased()) {
         return await handleError(
            auxdibot,
            'SUGGESTIONS_CHANNEL_NOT_FOUND',
            'No working suggestions channel was found! Ask an admin to enable suggestions by setting a suggestions channel.',
            interaction,
         );
      }
      const suggestion = <Suggestion>{
         suggestionID: await incrementSuggestionsTotal(auxdibot, interaction.data.guild.id),
         creatorID: interaction.data.member.id,
         content,
         status: SuggestionState.WAITING,
         handlerID: null,
         messageID: null,
         discussion_thread_id: null,
         handled_reason: null,
         date: new Date(),
      };
      const embed = DEFAULT_SUGGESTION_EMBED;
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.description = `Created a new suggestion (#${suggestion.suggestionID}).`;

      await auxdibot.createReply(interaction, { ephemeral: true, embeds: [successEmbed] });
      return await suggestions_channel
         .send({
            embeds: [
               JSON.parse(
                  await parsePlaceholders(auxdibot, JSON.stringify(embed), {
                     guild: interaction.data.guild,
                     member: interaction.data.member,
                     suggestion,
                  }),
               ),
            ],
         })
         .then(async (msg) => {
            if (!interaction.data) return;
            server.suggestions_reactions.forEach((reaction) => msg.react(reaction));
            suggestion.messageID = msg.id;
            if (server.suggestions_discussion_threads) {
               const thread = await msg
                  .startThread({
                     name: `Suggestion #${suggestion.suggestionID}`,
                     reason: 'New suggestion opened.',
                  })
                  .catch(() => undefined);
               if (thread) suggestion.discussion_thread_id = thread.id;
            }
            if (
               (await auxdibot.testLimit(
                  interaction.data.guildData.suggestions,
                  Limits.ACTIVE_SUGGESTIONS_DEFAULT_LIMIT,
                  interaction.guild,
                  true,
               )) == 'spliced'
            ) {
               await auxdibot.database.servers.update({
                  where: { serverID: interaction.data.guildData.serverID },
                  data: { suggestions: interaction.data.guildData.suggestions },
               });
            }
            createSuggestion(auxdibot, interaction.data.guild.id, suggestion);
            await auxdibot.log(interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `${interaction.data.member.user.username} created Suggestion #${suggestion.suggestionID}`,
               type: LogAction.SUGGESTION_CREATED,
               date: new Date(),
            });
         })
         .catch(async () => {
            await auxdibot.database.totals.update({
               where: { serverID: interaction.data.guild.id },
               data: { suggestions: { decrement: 1 } },
            });
            return await handleError(
               auxdibot,
               'SUGGESTIONS_CREATE_FAILED',
               'An error occurred trying to create that suggestion!',
               interaction,
            );
         });
   },
};
