import { Auxdibot } from '@/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction, ReactionRole } from '@prisma/client';
import { Guild, Message } from 'discord.js';

export default async function removeReactionRole(
   auxdibot: Auxdibot,
   guild: Guild,
   index: number,
   user?: { id: string; username: string },
) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { reaction_roles: true } })
      .then(async (data) => {
         if (!data) throw new Error("couldn't find that server");
         if (data.reaction_roles.length - 1 < Number(index)) throw new Error('invalid index provided');

         const reactionRole: ReactionRole = data.reaction_roles[index];
         if (!reactionRole) throw new Error("couldn't find that reaction role");
         const channel = auxdibot.channels.cache.get(reactionRole.channelID);
         const message: Message =
            channel && channel.isTextBased()
               ? await channel.messages.fetch(reactionRole.messageID).catch(() => undefined)
               : undefined;

         data.reaction_roles.splice(Number(index), 1);
         await handleLog(auxdibot, guild, {
            userID: user?.id ?? auxdibot.user.id,
            description: `Deleted a reaction role${
               channel && !channel.isDMBased() ? ` in ${channel.name || 'a channel'}` : ''
            }.`,
            type: LogAction.REACTION_ROLE_REMOVED,
            date: new Date(),
         });
         const result = await auxdibot.database.servers.update({
            where: { serverID: guild.id },
            data: { reaction_roles: data.reaction_roles },
         });
         if (message) message.delete().catch(() => undefined);
         return result;
      })
      .catch((x) => {
         throw new Error(x.message ?? 'an error occurred');
      });
}
