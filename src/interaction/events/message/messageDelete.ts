import { AuditLogEvent, GuildAuditLogs, Message, PartialMessage } from 'discord.js';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import deleteSuggestion from '@/modules/features/suggestions/deleteSuggestion';
import { Log, LogAction } from '@prisma/client';
import handleLog from '@/util/handleLog';
import removeReactionRole from '@/modules/features/roles/reaction_roles/removeReactionRole';
export default async function messageDelete(auxdibot: Auxdibot, message: Message<boolean> | PartialMessage) {
   const sender = message.member;
   // weird bandaid for checking if it's the bot deleting messages
   const auditEntry: GuildAuditLogs<AuditLogEvent.MessageDelete> | undefined = await message.guild
      ?.fetchAuditLogs({ limit: 10, type: AuditLogEvent.MessageDelete })
      .then((a) =>
         a.entries.find(
            (i) =>
               i.target.id == message.client.user.id &&
               i.extra.channel.id == message.channel.id &&
               Date.now() - i.createdTimestamp < 100000,
         ),
      )
      .catch(() => undefined);
   if (auditEntry && auditEntry?.entries?.size > 0) return;
   if (!sender || !message.guild) return;
   const server = await findOrCreateServer(auxdibot, message.guild.id);
   const rr = server.reaction_roles.find((rr) => rr.messageID == message.id);
   if (rr) {
      removeReactionRole(auxdibot, message.guild, server.reaction_roles.indexOf(rr), undefined);
   }
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
   }
   if (sender.user.bot) return;
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
