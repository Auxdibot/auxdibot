import { Auxdibot } from '@/interfaces/Auxdibot';
import { Message } from 'discord.js';

export function cacheMessage(auxdibot: Auxdibot, message: Message) {
   if (!auxdibot.messages.find((i) => i.message == message.id)) {
      auxdibot.messages.set(BigInt(Date.now()), {
         message: message.id,
         channel: message.channelId,
         author: message.author.id,
         attachments: message.attachments.size > 0,
         invites: message.content.includes('discord.gg/' || 'discordapp.com/invite/' || 'discord.com/invite/'),
      });
   }
}
