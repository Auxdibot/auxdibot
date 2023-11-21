import { Auxdibot } from '@/interfaces/Auxdibot';
import { Punishment, servers } from '@prisma/client';
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
            date_unix: Date.now(),
            reason: server.automod_invites_punishment.reason || 'You have exceeded the invites limit for this server!',
            userID: message.author.id,
            expired: false,
            moderatorID: '',
            dmed: false,
         };
         auxdibot.invites_detections.set([message.guildId, BigInt(Date.now())], previousMessages);
         await createPunishment(auxdibot, message.guild, punishment, undefined, message.author);
      }
   }
}
