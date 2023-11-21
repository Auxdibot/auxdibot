import { Auxdibot } from '@/interfaces/Auxdibot';
import { LogAction, Punishment, PunishmentType, servers } from '@prisma/client';
import { EmbedBuilder, Message } from 'discord.js';
import createPunishment from '../createPunishment';
import handleLog from '@/util/handleLog';
import incrementPunishmentsTotal from '../incrementPunishmentsTotal';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';

export default async function checkBlacklistedWords(auxdibot: Auxdibot, server: servers, message: Message) {
   if (server.automod_banned_phrases.length <= 0 || !server.automod_banned_phrases_punishment) return;
   for (const blacklist of server.automod_banned_phrases) {
      if (message.content.toUpperCase().includes(blacklist.toUpperCase())) {
         if (server.automod_banned_phrases_punishment == PunishmentType.DELETE_MESSAGE) {
            const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.punishment).toJSON();
            dmEmbed.title = '🗑️ Message Deleted';
            dmEmbed.description = `Your message was deleted on ${
               message.guild ? message.guild.name : 'Server'
            } for including the blacklisted phrase "${blacklist}"`;
            dmEmbed.fields = [
               {
                  name: 'Deleted Message',
                  value: `Deleted Content: \n\`\`\`${message.cleanContent}\`\`\``,
                  inline: false,
               },
            ];
            message.delete().then(async () => {
               await message.author
                  .send({ embeds: [dmEmbed] })
                  .then(() => true)
                  .catch(() => false);
               await handleLog(
                  auxdibot,
                  message.guild,
                  {
                     type: LogAction.MESSAGE_DELETED_AUTOMOD,
                     userID: message.author.id,
                     date_unix: Date.now(),
                     description: `A message was deleted in ${
                        !message.channel.isDMBased() ? message.channel.name : 'a channel'
                     } because it included the blacklisted phrase "${blacklist}"`,
                  },
                  [
                     {
                        name: 'Deleted Message',
                        value: `Deleted Content: \n\`\`\`${message.cleanContent}\`\`\``,
                        inline: false,
                     },
                  ],
               );
            });
         } else {
            const punishment = <Punishment>{
               punishmentID: await incrementPunishmentsTotal(auxdibot, server.serverID),
               type: server.automod_banned_phrases_punishment,
               date_unix: Date.now(),
               reason: `Usage of blacklisted phrase "${blacklist}"`,
               userID: message.author.id,
               expired: false,
               moderatorID: '',
               dmed: false,
            };
            message
               .delete()
               .then(async () => {
                  await handleLog(
                     auxdibot,
                     message.guild,
                     {
                        type: LogAction.MESSAGE_DELETED_AUTOMOD,
                        userID: message.author.id,
                        date_unix: Date.now(),
                        description: `A message was deleted in ${
                           !message.channel.isDMBased() ? message.channel.name : 'a channel'
                        } because it included the blacklisted phrase "${blacklist}" (user was ${
                           PunishmentValues[server.automod_banned_phrases_punishment].action
                        })`,
                     },
                     [
                        {
                           name: 'Deleted Message',
                           value: `Deleted Content: \n\`\`\`${message.cleanContent}\`\`\``,
                           inline: false,
                        },
                     ],
                  );
                  await createPunishment(auxdibot, message.guild, punishment, undefined, message.author);
               })
               .catch(() => undefined);
         }
      }
   }
}
