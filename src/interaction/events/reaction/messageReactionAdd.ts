import { GuildMember, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { starboardReaction } from '@/modules/features/starboard/starboardReaction';

export default async function messageReactionAdd(
   auxdibot: Auxdibot,
   messageReaction: MessageReaction | PartialMessageReaction,
   user: User | PartialUser,
) {
   if (user.id == messageReaction.client.user.id) return;
   if (!messageReaction.message.guild) return;
   const server = await findOrCreateServer(auxdibot, messageReaction.message.guild.id);
   const member: GuildMember | null = messageReaction.message.guild.members.resolve(user.id);
   if (!member) return;
   if (!server.disabled_modules.find((item) => item == Modules['Roles'].name)) {
      const rrData = server.reaction_roles.find((rr) => messageReaction.message.id == rr.messageID);
      if (rrData && ['DEFAULT', 'STICKY', 'SELECT_ONE', 'STICKY_SELECT_ONE'].includes(rrData.type)) {
         const rr = rrData.reactions.find(
            (react) => react.emoji == (messageReaction.emoji.valueOf() || messageReaction.emoji.toString()),
         );
         if (rr) {
            if (rrData.type != 'STICKY' && rrData.type != 'STICKY_SELECT_ONE')
               await messageReaction.users.remove(user.id).catch(() => undefined);

            if (rrData.type == 'STICKY_SELECT_ONE') {
               const userReacted = messageReaction.message.reactions.cache.filter(
                  (i) => i.emoji.valueOf() != rr.emoji && i.emoji.toString() != rr.emoji,
               );
               for (const reaction of userReacted.values()) {
                  reaction.users.remove(user.id).catch(() => undefined);
                  member.roles
                     .remove(
                        rrData.reactions.find(
                           (i) =>
                              i.emoji == messageReaction.emoji.valueOf() || i.emoji == messageReaction.emoji.toString(),
                        ).role,
                     )
                     .catch(() => undefined);
               }
               const userRoles = rrData.reactions.filter((i) => i.role != rr.role);
               for (const role of userRoles) {
                  await member.roles.remove(role.role).catch(() => undefined);
               }
            }
            if (member.roles.resolve(rr.role)) {
               await member.roles.remove(rr.role);
            } else {
               await member.roles.add(rr.role).catch((x) => {
                  if (x.code == 50013) {
                     handleLog(auxdibot, messageReaction.message.guild, {
                        type: LogAction.ERROR,
                        userID: user.id,
                        description: `Auxdibot does not have permission to assign the role <@&${rr.role}> to <@${member.id}>.`,
                        date: new Date(),
                     });
                  }
               });
            }
         }
      }
   }

   starboardReaction(auxdibot, messageReaction, user);
}
