import { Auxdibot } from '@/Auxdibot';
import { LogAction, Punishment, servers } from '@prisma/client';
import { Message } from 'discord.js';
import createPunishment from '../createPunishment';
import incrementPunishmentsTotal from '../incrementPunishmentsTotal';

export default async function checkInvitesSpam(auxdibot: Auxdibot, server: servers, message: Message) {
   if (server.automod_invites_limit?.duration && server.automod_invites_punishment?.punishment) {
      const previousMessages = auxdibot.messages.filter(
         (i, sent) =>
            sent > BigInt(Date.now() - server.automod_invites_limit.duration) &&
            i.invites &&
            !auxdibot.invites_detections.find((i) => i.has(sent)),
      );
      if (previousMessages.size > server.automod_invites_limit.messages) {
         const punishment = <Punishment>{
            punishmentID: await incrementPunishmentsTotal(auxdibot, server.serverID),
            type: server.automod_invites_punishment.punishment,
            date: new Date(),
            reason: server.automod_invites_punishment.reason || 'You have exceeded the invites limit for this server!',
            userID: message.author.id,
            expired: false,
            moderatorID: '',
            dmed: false,
         };
         auxdibot.invites_detections.set([message.guildId, BigInt(Date.now())], previousMessages);
         await createPunishment(auxdibot, message.guild, punishment, undefined, message.author).catch(() => (x) => {
            auxdibot.log(
               message.guild,
               {
                  type: LogAction.ERROR,
                  date: new Date(),
                  description: `Failed to create punishment for ${message.author.tag} (${message.author.id})`,
                  userID: message.author.id,
               },
               {
                  fields: [{ name: 'Error Message', value: x.message, inline: false }],
               },
            );
         });
      }
   }
}
