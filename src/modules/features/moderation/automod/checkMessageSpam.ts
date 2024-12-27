import { Auxdibot } from '@/Auxdibot';
import { LogAction, punishments, servers } from '@prisma/client';
import { Guild, Message } from 'discord.js';
import createPunishment from '../createPunishment';
import incrementPunishmentsTotal from '../incrementPunishmentsTotal';

export default async function checkMessageSpam(auxdibot: Auxdibot, guild: Guild, server: servers, message: Message) {
   if (server.automod_spam_limit?.duration && server.automod_spam_punishment?.punishment) {
      const previousMessages = guild.channels.cache.reduce((acc, channel) => {
         if (!channel.isTextBased()) return acc;
         const messages = channel.messages.cache.filter(
            (m) =>
               m.author.id === message.author.id &&
               m.createdTimestamp > Date.now() - server.automod_spam_limit.duration &&
               !auxdibot.spam_detections.find((i) => i.includes(m.id)),
         );
         return acc.concat(Array.from(messages.values()));
      }, new Array<Message>());
      if (previousMessages.length > server.automod_spam_limit.messages) {
         const punishment = <punishments>{
            punishmentID: await incrementPunishmentsTotal(auxdibot, server.serverID),
            type: server.automod_spam_punishment.punishment,
            date: new Date(),
            reason: server.automod_spam_punishment.reason || 'You have exceeded the spam limit for this server!',
            userID: message.author.id,
            expired: false,
            serverID: server.serverID,
            moderatorID: '',
            dmed: false,
         };
         auxdibot.spam_detections.set(
            [message.guildId, BigInt(Date.now())],
            previousMessages.map((i) => i.id),
         );
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
