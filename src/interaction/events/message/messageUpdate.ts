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
   if (!sender || sender.user.bot || !newMessage.guild) return;
   if (newMessage.member && newMessage.member.user.id == newMessage.client.user.id) return;
   const oldContent = await oldMessage.fetch();
   if (oldContent.content && oldContent.content != newMessage.content) {
      await handleLog(
         auxdibot,
         newMessage.guild,
         <Log>{
            type: LogAction.MESSAGE_EDITED,
            date_unix: Date.now(),
            description: `A message by ${sender.user.username} was edited.`,
            userID: sender.id,
         },
         [
            {
               name: 'Edited Message',
               value: `Old: \n\`\`\`${oldContent.cleanContent}\`\`\`\n\nNew: \n\`\`\`${newMessage.cleanContent}\`\`\``,
               inline: false,
            },
         ],
      );
   }
   return;
}
