import { GuildTextBasedChannel } from 'discord.js';

export default async function purgeMessages(
   channel: GuildTextBasedChannel,
   amount: number,
   delete_bot: boolean,
   userID?: string,
   filter?: string,
   attachments?: boolean,
   invites?: boolean,
   embeds?: boolean,
) {
   const messages = await channel.messages.fetch({ limit: amount });
   const filtered = messages.filter(
      (i) =>
         (delete_bot || !i.author.bot) &&
         (userID ? i.author.id == userID : true) &&
         (filter ? new RegExp(filter, 'g').test(i.content) : true) &&
         (attachments ? i.attachments.size > 0 : true) &&
         (invites ? i.content.includes('discord.gg/' || 'discordapp.com/invite/' || 'discord.com/invite/') : true) &&
         (embeds ? i.embeds.length > 0 : true),
   );
   let totalDeleted = 0;
   let failedDeletions = 0;
   if (filtered) {
      for (const msg of filtered.values()) {
         await msg
            .delete()
            .then(() => totalDeleted++)
            .catch(() => failedDeletions++);
      }
   }

   return { totalDeleted, failedDeletions };
}
