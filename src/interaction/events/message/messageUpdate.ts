import { Message, PartialMessage } from 'discord.js';

import { Auxdibot } from '@/Auxdibot';

import { LogAction } from '@prisma/client';
import checkBlacklistedWords from '@/modules/features/moderation/automod/checkBlacklistedWords';
import findOrCreateServer from '@/modules/server/findOrCreateServer';

export default async function messageUpdate(
   auxdibot: Auxdibot,
   oldMessage: Message<boolean> | PartialMessage,
   newMessage: Message<boolean> | PartialMessage,
) {
   const sender = newMessage.member;
   if (!sender || sender.user.bot || !newMessage.guild) return;
   if (newMessage.member && newMessage.member.user.id == newMessage.client.user.id) return;
   const server = await findOrCreateServer(auxdibot, newMessage.guildId);

   /*
   Message Log
   */
   if (oldMessage.content != newMessage.content && oldMessage.content && newMessage.content) {
      const channel = await newMessage.channel.fetch().catch(() => undefined);
      await auxdibot.log(
         newMessage.guild,
         {
            type: LogAction.MESSAGE_EDITED,
            date: new Date(),
            description: `A message by ${sender.user.username} in #${channel?.name ?? newMessage.channel} was edited.`,
            userID: sender.id,
         },
         {
            fields: [
               {
                  name: 'Edited Message',
                  value: `Author: ${newMessage.author}\nChannel: ${
                     newMessage.channel
                  } ([Original Message](https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${
                     newMessage.id
                  }))${
                     oldMessage.content
                        ? `\n\n**Old Message** \n\`\`\`${oldMessage.content.replaceAll('`', '')}\`\`\``
                        : ''
                  }\n${
                     oldMessage.attachments && oldMessage.attachments.size > 0
                        ? `Attachments: ${oldMessage.attachments.map((i) => `[${i.name}](${i.proxyURL})`).join(', ')}`
                        : ''
                  }\n\n**New Message** \n\`\`\`${newMessage.cleanContent.replaceAll('`', '')}\`\`\`\n${
                     newMessage.attachments && newMessage.attachments.size > 0
                        ? `Attachments: ${newMessage.attachments.map((i) => `[${i.name}](${i.proxyURL})`).join(', ')}`
                        : ''
                  }`,
                  inline: false,
               },
            ],
         },
      );
   }

   /*
   Automod
   */

   if (!server.automod_role_exceptions.some((i) => newMessage.member.roles.cache.has(i))) {
      const message = await newMessage.fetch().catch(() => undefined);
      if (message) {
         checkBlacklistedWords(auxdibot, server, message);
      }
   }
   return;
}
