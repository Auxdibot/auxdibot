import { Message, PartialMessage } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import deleteSuggestion from '@/modules/features/suggestions/deleteSuggestion';
import { Log, LogAction } from '@prisma/client';
import handleLog from '@/util/handleLog';
export default async function messageDelete(auxdibot: Auxdibot, message: Message<boolean> | PartialMessage) {
   const sender = message.member;

   if (!sender || message.author.bot || !message.guild) return;
   const server = await findOrCreateServer(auxdibot, message.guild.id);
   const rr = server.reaction_roles.find((rr) => rr.messageID == message.id);
   const suggestion = server.suggestions.find((suggestion) => suggestion.messageID == message.id);
   const starboard = server.starred_messages.find(
      (starred_message) =>
         starred_message.starboard_message_id == message.id || starred_message.starred_message_id == message.id,
   );
   if (suggestion) {
      await deleteSuggestion(auxdibot, message.guild.id, suggestion.suggestionID);
      await handleLog(auxdibot, message.guild, <Log>{
         type: LogAction.SUGGESTION_DELETED,
         date_unix: Date.now(),
         description: `${sender.user.username} deleted Suggestion #${suggestion.suggestionID}`,
         userID: sender.id,
      });
      return;
   }
   if (rr) {
      server.reaction_roles.splice(server.reaction_roles.indexOf(rr), 1);
      await auxdibot.database.servers.update({
         where: { serverID: message.guild.id },
         data: { reaction_roles: server.reaction_roles },
      });
      await handleLog(auxdibot, message.guild, <Log>{
         type: LogAction.REACTION_ROLE_REMOVED,
         date_unix: Date.now(),
         description: `Deleted a reaction role${message ? ` in ${message.channel?.toString() || 'a channel'}` : ''}.`,
         userID: sender.id,
      });
      return;
   }
   if (starboard) {
      server.starred_messages.splice(server.starred_messages.indexOf(starboard), 1);
      const starboard_channel = message.guild.channels.cache.get(server.starboard_channel);
      const starboard_message =
         starboard_channel && starboard_channel.isTextBased()
            ? starboard_channel.messages.cache.get(starboard.starboard_message_id)
            : undefined;
      if (starboard_message && starboard_message.deletable)
         await starboard_message.delete().catch((x) => console.log(x));
      await auxdibot.database.servers.update({
         where: { serverID: message.guild.id },
         data: { starred_messages: server.starred_messages },
      });
      await handleLog(auxdibot, message.guild, <Log>{
         type: LogAction.STARBOARD_MESSAGE_DELETED,
         date_unix: Date.now(),
         description: `Deleted a starred message${message ? ` in ${message.channel?.toString() || 'a channel'}` : ''}.`,
         userID: sender.id,
      });
      return;
   }
   if (sender.id == message.client.user.id) return;
   await handleLog(
      auxdibot,
      message.guild,
      <Log>{
         type: LogAction.MESSAGE_EDITED,
         date_unix: Date.now(),
         description: `A message by ${sender.user.username} was deleted.`,
         userID: sender.id,
      },
      [
         {
            name: 'Deleted Message',
            value: `Deleted Content: \n\`\`\`${message.cleanContent}\`\`\``,
            inline: false,
         },
      ],
   );
   return;
}
