import { AuditLogEvent, GuildAuditLogs, Message, PartialMessage, User } from 'discord.js';
import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import deleteSuggestion from '@/modules/features/suggestions/deleteSuggestion';
import { Log, LogAction } from '@prisma/client';

import removeReactionRole from '@/modules/features/roles/reaction_roles/removeReactionRole';
import deleteStarredMessage from '@/modules/features/starboard/messages/deleteStarredMessage';
export default async function messageDelete(auxdibot: Auxdibot, message: Message<boolean> | PartialMessage) {
   if (!message.guild) return;
   const sender = message.member;
   // weird bandaid for checking if it's the bot deleting messages
   const deletionEntryCheck: GuildAuditLogs<AuditLogEvent.MessageDelete> | undefined = await message.guild
      ?.fetchAuditLogs({ limit: 10, type: AuditLogEvent.MessageDelete })
      .then((a) =>
         a.entries.find(
            (i) =>
               i.target.id == message.client?.user?.id &&
               i.extra.channel.id == message.channel.id &&
               Date.now() - i.createdTimestamp < 100000,
         ),
      )
      .catch(() => undefined);
   if (deletionEntryCheck && deletionEntryCheck?.entries?.size > 0) return;
   const server = await findOrCreateServer(auxdibot, message.guild.id);
   const rr = server.reaction_roles.find((rr) => rr.messageID == message.id);
   if (rr) {
      removeReactionRole(auxdibot, message.guild, server.reaction_roles.indexOf(rr), undefined);
   }

   const suggestion = server.suggestions.find((suggestion) => suggestion.messageID == message.id);

   if (suggestion) {
      await deleteSuggestion(auxdibot, message.guild.id, suggestion.suggestionID);
      await auxdibot.log(message.guild, <Log>{
         type: LogAction.SUGGESTION_DELETED,
         date: new Date(),
         description: `A suggestion message deletion deleted Suggestion #${suggestion.suggestionID}`,
         userID: message?.member?.id ?? auxdibot.user.id,
      });
   }

   for (const starboard of server.starred_messages.filter(
      (i) => i.starred_message_id == message.id || i.starboard_message_id == message.id,
   )) {
      deleteStarredMessage(auxdibot, message.guild, starboard);
   }
   if (!sender || sender?.user.bot || sender?.id == auxdibot.user.id) return;
   const channel = await message.channel.fetch().catch(() => undefined);
   const executorCheck: User | undefined = await message.guild
      ?.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MessageDelete })
      .then(
         (a) =>
            a.entries.find((i) => i.targetId == message.author?.id && i.extra.channel.id == message.channel.id)
               ?.executor,
      )
      .catch(() => undefined);
   await auxdibot.log(
      message.guild,
      <Log>{
         type: LogAction.MESSAGE_DELETED,
         date: new Date(),
         description: `A message by ${sender?.user?.username ?? auxdibot.user.username} in #${
            channel?.name ?? message.channel
         } was deleted${executorCheck ? ` by ${executorCheck.username}` : ''}.`,
         userID: executorCheck?.id ?? sender?.user?.id,
      },
      {
         fields: [
            {
               name: 'Deleted Message',
               value: `${executorCheck ? `Executor: ${executorCheck}` : ''}\nAuthor: ${message.author}\nChannel: ${
                  message.channel
               }\n\n**Deleted Content** \n\`\`\`${message.cleanContent.replaceAll('`', '')}\`\`\``,
               inline: false,
            },
         ],
      },
   );
   return;
}
