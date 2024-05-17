import { GuildMember, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import updateStarredMessage from '@/modules/features/starboard/messages/updateStarredMessage';
import deleteStarredMessage from '@/modules/features/starboard/messages/deleteStarredMessage';

export default async function messageReactionRemove(
   auxdibot: Auxdibot,
   messageReaction: MessageReaction | PartialMessageReaction,
   user: User | PartialUser,
) {
   const server = await findOrCreateServer(auxdibot, messageReaction.message.guildId);
   const member: GuildMember | null = messageReaction.message.guild.members.resolve(user.id);
   if (!member) return;
   if (!server.disabled_modules.find((item) => item == Modules['Roles'].name)) {
      const rrData = server.reaction_roles.find((rr) => messageReaction.message.id == rr.messageID);
      if (rrData && ['STICKY', 'STICKY_SELECT_ONE'].includes(rrData.type)) {
         const rr = rrData.reactions.find(
            (react) => react.emoji == (messageReaction.emoji.valueOf() || messageReaction.emoji.toString()),
         );
         if (rr) {
            if (member.roles.resolve(rr.role)) await member.roles.remove(rr.role).catch(() => undefined);
         }
      }
   }
   if (!server.disabled_modules.find((item) => item == Modules['Starboard'].name)) {
      const starred = server.starred_messages.find((i) => i.starred_message_id == messageReaction.message.id);
      const starboard_channel = messageReaction.message.guild.channels.cache.get(server.starboard_channel);
      const starCount =
         (await messageReaction.message.reactions.cache.get(server.starboard_reaction)?.fetch())?.count || 0;
      if (starboard_channel && starboard_channel.isTextBased()) {
         if (starred && starCount < server.starboard_reaction_count) {
            await deleteStarredMessage(auxdibot, messageReaction);
         } else if (starred) {
            const message = starboard_channel.messages.cache.get(starred.starboard_message_id);
            if (message) {
               await updateStarredMessage(auxdibot, messageReaction);
            } else {
               server.starred_messages.splice(server.starred_messages.indexOf(starred), 1);
               await auxdibot.database.servers
                  .update({
                     where: { serverID: messageReaction.message.guild.id },
                     data: { starred_messages: server.starred_messages },
                  })
                  .catch(() => undefined);
            }
         }
      }
   }
}
