import { Auxdibot } from '@/interfaces/Auxdibot';
import { Punishment, servers } from '@prisma/client';
import { Message } from 'discord.js';
import createPunishment from '../createPunishment';
import incrementPunishmentsTotal from '../incrementPunishmentsTotal';

export default async function checkMessageSpam(auxdibot: Auxdibot, server: servers, message: Message) {
   if (server.automod_spam_limit?.duration && server.automod_spam_punishment?.punishment) {
      const previousMessages = auxdibot.messages.filter(
         (_i, sent) =>
            sent > BigInt(Date.now() - server.automod_spam_limit.duration) &&
            !auxdibot.spam_detections.find((i) => i.has(sent)),
      );
      if (previousMessages.size > server.automod_spam_limit.messages) {
         const punishment = <Punishment>{
            punishmentID: await incrementPunishmentsTotal(auxdibot, server.serverID),
            type: server.automod_spam_punishment.punishment,
            date_unix: Date.now(),
            reason: server.automod_spam_punishment.reason || 'You have exceeded the spam limit for this server!',
            userID: message.author.id,
            expired: false,
            moderatorID: '',
            dmed: false,
         };
         auxdibot.spam_detections.set([message.guildId, BigInt(Date.now())], previousMessages);
         await createPunishment(auxdibot, message.guild, punishment, undefined, message.author);
      }
   }
}
