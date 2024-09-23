import { EmbedBuilder, ModalSubmitInteraction, OverwriteResolvable, PermissionsBitField } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import toggleModule from '@/modules/features/settings/toggleModule';
import setSuggestionsChannel from '@/modules/features/suggestions/setSuggestionsChannel';
import setSuggestionsUpdatesChannel from '@/modules/features/suggestions/setSuggestionsUpdatesChannel';
import setSuggestionsDiscussionThreads from '@/modules/features/suggestions/setSuggestionsDiscussionThreads';
import deleteSuggestionsReaction from '@/modules/features/suggestions/deleteSuggestionsReaction';
import addSuggestionsReaction from '@/modules/features/suggestions/addSuggestionsReaction';
import { updateCommandPermissions } from '@/modules/features/commands/updateCommandPermissions';

export default <AuxdibotModal>{
   module: Modules['Settings'],
   name: 'suggestions',
   command: 'setup suggestions',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
      if (!interaction.guildId) return;
      const server = await findOrCreateServer(auxdibot, interaction.guildId);
      const suggestionChannel = interaction.fields.getTextInputValue('suggestions_channel'),
         suggestionUpdates = interaction.fields.getTextInputValue('suggestions_updates'),
         suggestionDiscussions = interaction.fields.getTextInputValue('suggestions_discussions'),
         suggestionReactions = interaction.fields.getTextInputValue('suggestions_reactions'),
         suggestionsRole = interaction.fields.getTextInputValue('suggestions_role');
      await interaction.deferReply();
      try {
         if (server.disabled_modules.includes('Suggestions'))
            await toggleModule(auxdibot, interaction.guild, 'Suggestions', true);
         const discussionsResult = await setSuggestionsDiscussionThreads(
            auxdibot,
            interaction.guild,
            interaction.user,
            !/$no^/i.test(suggestionDiscussions),
         ).catch(() => null);
         const role = suggestionsRole
            ? await interaction.guild.roles
                 .create({
                    name: suggestionsRole,
                 })
                 .catch(() => undefined)
            : undefined;
         if (role) {
            await updateCommandPermissions(auxdibot, interaction.guildId, 'suggestions', ['respond'], {
               roles: [role.id],
               admin_only: false,
               permission_bypass_roles: [role.id],
            }).catch(() => undefined);
            await updateCommandPermissions(auxdibot, interaction.guildId, 'suggestions', ['ban'], {
               roles: [role.id],
               admin_only: false,
               permission_bypass_roles: [role.id],
            }).catch(() => undefined);
            await updateCommandPermissions(auxdibot, interaction.guildId, 'suggestions', ['unban'], {
               roles: [role.id],
               admin_only: false,
               permission_bypass_roles: [role.id],
            }).catch(() => undefined);
         }

         let channel = undefined;
         let updates = undefined;

         const permissionOverwrites: OverwriteResolvable[] = [
            {
               id: interaction.guild.roles.everyone.id,
               allow: discussionsResult?.suggestions_discussion_threads
                  ? [PermissionsBitField.Flags.SendMessagesInThreads]
                  : [],
               deny: [PermissionsBitField.Flags.SendMessages],
            },
         ];
         if (role)
            permissionOverwrites.push({
               id: role.id,
               allow: [PermissionsBitField.Flags.SendMessages],
            });
         channel = await interaction.guild.channels
            .create({
               name: suggestionChannel,
               permissionOverwrites,
            })
            .catch(() => null);
         if (suggestionUpdates)
            updates = await interaction.guild.channels
               .create({
                  name: suggestionUpdates,
                  permissionOverwrites,
               })
               .catch(() => null);

         const channelResult = await setSuggestionsChannel(
            auxdibot,
            interaction.guild,
            interaction.user,
            channel,
         ).catch(() => null);
         const updatesResult = await setSuggestionsUpdatesChannel(
            auxdibot,
            interaction.guild,
            interaction.user,
            updates,
         ).catch(() => null);

         for (let i = 0; i < server.suggestions_reactions.length; i++) {
            await deleteSuggestionsReaction(auxdibot, interaction.guild, 0).catch(() => null);
         }
         const reactions = suggestionReactions ? suggestionReactions.split(',') : ['🔼', '🟦', '🔽'];
         const added = [];
         for (const r of reactions) {
            await addSuggestionsReaction(auxdibot, interaction.guild, interaction.user, r)
               .then(() => added.push(r))
               .catch(() => undefined);
         }
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.author = { name: interaction.user.username, icon_url: interaction.user.avatarURL({ size: 128 }) };
         embed.title = '🔨 Setup Summary';
         embed.description = `\nSuggestions Channel: ${channel && channelResult ? channel : '❌'}\nUpdates Channel: ${
            updates && updatesResult ? updates : '❌'
         }\n\nDiscussion Threads: ${
            discussionsResult
               ? `✅ ${
                    discussionsResult.suggestions_discussion_threads
                       ? 'Auxdibot will create discussion threads for every suggestion.'
                       : 'Auxdibot will no longer create discussion threads for every suggestion.'
                 }`
               : '❌'
         }\n\nSuggestion Reactions: ${added.length > 0 ? added.join(', ') : '❌'}\nSuggestions Role: ${role ?? '❌'}\n\n
            Suggestions have been configured. Users can create suggestions by running the \`/suggest\` command, and Administrators can respond to them by running the \`/suggestions respond\` command. You can update the suggestions settings at any time by running the \`/suggestions\` commands.`;
         return await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         console.error(x);
         handleError(
            auxdibot,
            'SUGGESTIONS_SETUP_FAILURE',
            `The suggestions setup failed! This may be possible due to several reasons\n\n* An error occurred configuring the command permissions for the created suggestion role.\n* Something went wrong when creating a channel.\n* An error occurred because of Auxdibot not having permission.\n`,
            interaction,
         );
      }
   },
};
