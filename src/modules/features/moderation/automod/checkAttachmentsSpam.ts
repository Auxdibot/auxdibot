import { Auxdibot } from '@/Auxdibot';
import { LogAction, Punishment, servers } from '@prisma/client';
import { Guild, Message } from 'discord.js';
import createPunishment from '../createPunishment';
import incrementPunishmentsTotal from '../incrementPunishmentsTotal';

export default async function checkAttachmentsSpam(
   auxdibot: Auxdibot,
   guild: Guild,
   server: servers,
   message: Message,
) {
   if (server.automod_attachments_limit?.duration && server.automod_attachments_punishment?.punishment) {
      const previousMessages = guild.channels.cache.reduce((acc, channel) => {
         if (!channel.isTextBased()) return acc;
         const messages = channel.messages.cache.filter(
            (m) =>
               m.author.id === message.author.id &&
               m.attachments.size > 0 &&
               m.createdTimestamp > Date.now() - server.automod_attachments_limit.duration &&
               !auxdibot.attachments_detections.find((i) => i.includes(m.id)),
         );
         return acc.concat(Array.from(messages.values()));
      }, new Array<Message>());
      if (previousMessages.length > server.automod_attachments_limit.messages) {
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
         auxdibot.attachments_detections.set(
            [message.guildId, BigInt(Date.now())],
            previousMessages.map((i) => i.id),
         );
         await createPunishment(auxdibot, message.guild, punishment, undefined, message.author).catch((x) => {
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
