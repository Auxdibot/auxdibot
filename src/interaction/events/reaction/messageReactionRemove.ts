import { GuildMember, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { starboardReaction } from '@/modules/features/starboard/starboardReaction';

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
   starboardReaction(auxdibot, messageReaction, user);
}
