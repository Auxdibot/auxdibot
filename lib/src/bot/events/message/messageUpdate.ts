import { Message, PartialMessage } from 'discord.js';
import Server from '@/mongo/model/server/Server';
import { LogType } from '@/config/Log';

export default async function messageUpdate(
   oldMessage: Message<boolean> | PartialMessage,
   newMessage: Message<boolean> | PartialMessage,
) {
   const sender = newMessage.member;
   if (!sender || !newMessage.guild) return undefined;
   if (newMessage.member && newMessage.member.user.id == newMessage.client.user.id) return undefined;
   const server = await Server.findOrCreateServer(newMessage.guild.id);
   if (oldMessage.content != newMessage.content) {
      await server.log(newMessage.guild, {
         type: LogType.MESSAGE_EDITED,
         date_unix: Date.now(),
         description: `A message by ${sender.user.tag} was edited.`,
         message_edit: { former: oldMessage.cleanContent, now: newMessage.cleanContent },
         user_id: sender.id,
      });
   }
   return;
}
