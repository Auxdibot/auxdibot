import { Guild, Message, TextChannel } from 'discord.js';

/**
 * Retrieves a message from a guild's channels based on the provided message ID.
 * @param guild - The guild object from which to retrieve the message.
 * @param message_id - The ID of the message to retrieve.
 * @returns A Promise that resolves to the retrieved message, or undefined if the message is not found.
 */
export async function getMessage(guild: Guild, message_id: string) {
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
}
