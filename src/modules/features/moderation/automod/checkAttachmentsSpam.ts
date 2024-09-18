import { Auxdibot } from '@/interfaces/Auxdibot';
import { Punishment, servers } from '@prisma/client';
import { Message } from 'discord.js';
import createPunishment from '../createPunishment';
import incrementPunishmentsTotal from '../incrementPunishmentsTotal';

export default async function checkAttachmentsSpam(auxdibot: Auxdibot, server: servers, message: Message) {
   if (server.automod_attachments_limit?.duration && server.automod_attachments_punishment?.punishment) {
      const previousMessages = auxdibot.messages.filter(
         (i, sent) =>
            sent > BigInt(Date.now() - server.automod_attachments_limit.duration) &&
            i.attachments &&
            !auxdibot.attachments_detections.find((i) => i.has(sent)),
      );
      if (previousMessages.size > server.automod_attachments_limit.messages) {
         const punishment = <Punishment>{
            punishmentID: await incrementPunishmentsTotal(auxdibot, server.serverID),
            type: server.automod_attachments_punishment.punishment,
            date: new Date(),
            reason:
               server.automod_attachments_punishment.reason ||
               'You have exceeded the attachments limit for this server!',
            userID: message.author.id,
            expired: false,
            moderatorID: '',
            dmed: false,
         };
         auxdibot.attachments_detections.set([message.guildId, BigInt(Date.now())], previousMessages);
         await createPunishment(auxdibot, message.guild, punishment, undefined, message.author).catch(() => undefined);
      }
   }
}
