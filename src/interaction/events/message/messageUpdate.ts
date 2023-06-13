import { Message, PartialMessage } from 'discord.js';

import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { Log, LogAction } from '@prisma/client';

export default async function messageUpdate(
   auxdibot: Auxdibot,
   oldMessage: Message<boolean> | PartialMessage,
   newMessage: Message<boolean> | PartialMessage,
) {
   const sender = newMessage.member;
   if (!sender || !newMessage.guild) return undefined;
   if (newMessage.member && newMessage.member.user.id == newMessage.client.user.id) return undefined;
   if (oldMessage.content != newMessage.content) {
      await handleLog(
         auxdibot,
         newMessage.guild,
         <Log>{
            type: LogAction.MESSAGE_EDITED,
            date_unix: Date.now(),
            description: `A message by ${sender.user.tag} was edited.`,
            userID: sender.id,
         },
         [
            {
               name: 'Edited Message',
               value: `Old: \n\`\`\`${oldMessage.cleanContent}\`\`\`\n\nNew: \n\`\`\`${newMessage.cleanContent}\`\`\``,
               inline: false,
            },
         ],
      );
   }
   return;
}
