import { Message } from 'discord.js';
import Server from '@models/server/Server';
import { LogType } from '@util/types/Log';
import { IReactionRole } from '@schemas/ReactionRoleSchema';

module.exports = {
   name: 'messageDelete',
   once: false,
   async execute(message: Message) {
      const sender = message.member;
      if (!sender || !message.guild) return;
      const server = await Server.findOrCreateServer(message.guild.id);
      const data = await server.fetchData();
      const rr = data.reaction_roles.find((rr: IReactionRole) => rr.message_id == message.id);
      const suggestion = data.suggestions.find((suggestion) => suggestion.message_id == message.id);
      if (suggestion) {
         data.removeSuggestion(suggestion.suggestion_id);
         await server.log({
            user_id: sender.id,
            description: `${sender.user.tag} deleted Suggestion #${suggestion.suggestion_id}`,
            type: LogType.SUGGESTION_DELETED,
            date_unix: Date.now(),
         });
      }
      if (rr) {
         data.removeReactionRole(data.reaction_roles.indexOf(rr));
         await server.log({
            user_id: sender.id,
            description: `Deleted a reaction role${message ? ` in ${message.channel || 'a channel'}` : ''}.`,
            type: LogType.REACTION_ROLE_REMOVED,
            date_unix: Date.now(),
         });
      }
      await server.log({
         type: LogType.MESSAGE_DELETED,
         date_unix: Date.now(),
         description: `A message by ${sender.user.tag} was deleted.`,
         message_edit: { former: message.cleanContent, now: '[deleted]' },
         user_id: sender.id,
      });
   },
};
