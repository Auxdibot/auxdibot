import { Message } from 'discord.js';
import Server from '@/mongo/model/server/Server';
import { LogType } from '@/config/Log';
import { IReactionRole } from '@/mongo/schema/ReactionRoleSchema';
module.exports = {
   name: 'messageDelete',
   once: false,
   async execute(message: Message) {
      const sender = message.member;

      if (!sender || !message.guild) return;
      const server = await Server.findOrCreateServer(message.guild.id);
      const data = await server.fetchData();
      const settings = await server.fetchSettings();
      const rr = data.reaction_roles.find((rr: IReactionRole) => rr.message_id == message.id);
      const suggestion = data.suggestions.find((suggestion) => suggestion.message_id == message.id);
      const starboard = data.starred_messages.find(
         (starred_message) =>
            starred_message.message_id == message.id || starred_message.starred_message_id == message.id,
      );
      if (suggestion) {
         data.removeSuggestion(suggestion.suggestion_id);
         return await server.log(message.guild, {
            user_id: sender.id,
            description: `${sender.user.tag} deleted Suggestion #${suggestion.suggestion_id}`,
            type: LogType.SUGGESTION_DELETED,
            date_unix: Date.now(),
         });
      }
      if (rr) {
         data.reaction_roles.splice(data.reaction_roles.indexOf(rr), 1);
         await data.save({ validateModifiedOnly: true });
         return await server.log(message.guild, {
            user_id: sender.id,
            description: `Deleted a reaction role${message ? ` in ${message.channel || 'a channel'}` : ''}.`,
            type: LogType.REACTION_ROLE_REMOVED,
            date_unix: Date.now(),
         });
      }
      if (starboard) {
         data.starred_messages.splice(data.starred_messages.indexOf(starboard), 1);
         const starboard_channel = message.guild.channels.cache.get(settings.starboard_channel);
         const starboard_message =
            starboard_channel && starboard_channel.isTextBased()
               ? starboard_channel.messages.cache.get(starboard.message_id)
               : undefined;
         if (starboard_message && starboard_message.deletable)
            await starboard_message.delete().catch((x) => console.log(x));
         await data.save({ validateModifiedOnly: true });
         return await server.log(message.guild, {
            user_id: sender.id,
            description: `Deleted a starred message${message ? ` in ${message.channel || 'a channel'}` : ''}.`,
            type: LogType.STARBOARD_MESSAGE_DELETED,
            date_unix: Date.now(),
         });
      }
      if (sender.id == message.client.user.id) return undefined;
      await server.log(message.guild, {
         type: LogType.MESSAGE_DELETED,
         date_unix: Date.now(),
         description: `A message by ${sender.user.tag} was deleted.`,
         message_edit: { former: message.cleanContent, now: '[deleted]' },
         user_id: sender.id,
      });
   },
};
