import { Message } from 'discord.js';
import Server from '@models/server/Server';
import { LogType } from '@util/types/enums/Log';

module.exports = {
   name: 'messageUpdate',
   once: false,
   async execute(oldMessage: Message, newMessage: Message) {
      const sender = newMessage.member;
      if (!sender || !newMessage.guild) return undefined;
      if (newMessage.member && newMessage.member.user.id == newMessage.client.user.id) return undefined;
      const server = await Server.findOrCreateServer(newMessage.guild.id);
      if (oldMessage.content != newMessage.content) {
         return await server.log(newMessage.guild, {
            type: LogType.MESSAGE_EDITED,
            date_unix: Date.now(),
            description: `A message by ${sender.user.tag} was edited.`,
            message_edit: { former: oldMessage.cleanContent, now: newMessage.cleanContent },
            user_id: sender.id,
         });
      }
      return undefined;
   },
};
