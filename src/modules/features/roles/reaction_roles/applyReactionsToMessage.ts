import { Auxdibot } from '@/Auxdibot';
import { Guild, Message } from 'discord.js';
import { parseReactionsAndRoles } from './parseReactionsAndRoles';
import applyReactionRoles from './applyReactionRoles';
import { ReactionRoleType } from '@prisma/client';

export async function applyReactionsToMessages(
   auxdibot: Auxdibot,
   guild: Guild,
   message: Message,
   reactions: {
      emoji: string;
      roleID: string;
   }[],
   type: ReactionRoleType,
) {
   const reactionsAndRoles = await parseReactionsAndRoles(auxdibot, guild, reactions);
   if (reactionsAndRoles.length == 0) throw new Error('invalid reactions and roles');
   if (!message || !message.channel.isTextBased() || message.guild != guild) throw new Error('invalid message');
   applyReactionRoles(message.id, message.channel, reactionsAndRoles, type ?? ReactionRoleType.DEFAULT);
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         data: {
            reaction_roles: {
               push: {
                  messageID: message.id,
                  channelID: message.channel.id,
                  type: type ?? ReactionRoleType.DEFAULT,
                  reactions: reactionsAndRoles.map((i) => ({ role: i.role.id, emoji: i.emoji })),
               },
            },
         },
      })
      .then(() => true);
}
