import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { APIEmbed, Guild } from 'discord.js';

export async function storeEmbed(
   auxdibot: Auxdibot,
   guild: Guild,
   id: string,
   embed?: APIEmbed,
   content?: string,
   webhook_url?: string,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (!(await auxdibot.testLimit(server.stored_embeds, Limits.STORED_EMBED_LIMIT, guild))) {
      throw new Error('You have reached the maximum number of stored embeds');
   }
   if (embed) {
      if (embed.title && embed.title.length > 256) {
         throw new Error('Embed title cannot exceed 256 characters');
      }

      if (embed.description && embed.description.length > 2048) {
         throw new Error('Embed description cannot exceed 2048 characters');
      }

      if (embed.footer && embed.footer.text && embed.footer.text.length > 2048) {
         throw new Error('Embed footer text cannot exceed 2048 characters');
      }

      if (embed.author && embed.author.name && embed.author.name.length > 256) {
         throw new Error('Embed author name cannot exceed 256 characters');
      }

      if (embed.fields && embed.fields.length > 25) {
         throw new Error('Embeds cannot have more than 25 fields');
      }

      if (embed.fields) {
         for (const field of embed.fields) {
            if (field.name.length > 256) {
               throw new Error('Embed field name cannot exceed 256 characters');
            }
            if (field.value.length > 1024) {
               throw new Error('Embed field value cannot exceed 1024 characters');
            }
         }
      }
   }
   if (content && content.length > 2000) {
      throw new Error('Message content cannot exceed 2000 characters');
   }
   if (webhook_url && !/https:\/\/discord.com\/api\/webhooks\/[^\s\/]+?(?=\b)/.test(webhook_url)) {
      throw new Error('Invalid webhook url');
   }
   auxdibot.database.analytics
      .upsert({
         where: { botID: auxdibot.user.id },
         create: { botID: auxdibot.user.id },
         update: { embeds: { increment: 1 } },
      })
      .catch(() => undefined);
   return await auxdibot.database.servers.update({
      where: {
         serverID: guild.id,
      },
      data: {
         stored_embeds: {
            push: {
               id,
               embed: {
                  title: embed?.title,
                  description: embed?.description,
                  color: embed?.color,
                  fields: embed?.fields,
                  footer: embed?.footer,
                  thumbnail: embed?.thumbnail && {
                     url: embed?.thumbnail?.url,
                     height: embed?.thumbnail?.height,
                     width: embed?.thumbnail?.width,
                     proxy_url: embed?.thumbnail?.proxy_url,
                  },
                  image: embed?.image && {
                     url: embed?.image?.url,
                     height: embed?.image?.height,
                     width: embed?.image?.width,
                     proxy_url: embed?.image?.proxy_url,
                  },
                  author: embed?.author,
                  type: embed?.type,
                  url: embed?.url,
               },
               content,
               webhook_url,
               date_created: new Date(),
            },
         },
      },
   });
}
