import { APIEmbed } from '@prisma/client';

export const isEmbedEmpty = (embed: APIEmbed) =>
   !embed.author?.name &&
   !embed.title &&
   !embed.description &&
   (!embed.fields || embed.fields.length == 0) &&
   !embed.footer?.text;
