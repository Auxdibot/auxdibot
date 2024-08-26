import { APIEmbed } from '@prisma/client';

export const isEmbedEmpty = (embed?: Partial<APIEmbed>) =>
   !embed ||
   (!embed.author?.name &&
      !embed.title &&
      !embed.description &&
      (!embed.fields || embed.fields.length == 0) &&
      !embed.footer?.text);
