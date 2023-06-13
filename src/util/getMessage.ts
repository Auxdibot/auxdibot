import { Guild, Message, TextChannel } from 'discord.js';

export const getMessage = async (guild: Guild, message_id: string) =>
   await guild.channels.cache.reduce(async (accumulator: Promise<Message<boolean> | undefined>, channel) => {
      const msg = await accumulator;
      if (channel.isTextBased() && !msg) {
         return Promise.resolve(
            (channel as TextChannel).messages
               .fetch(message_id)
               .then((message) => message)
               .catch(() => msg),
         );
      }
      return msg;
   }, Promise.resolve(undefined));
