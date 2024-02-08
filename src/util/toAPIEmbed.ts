import EmbedParameters from '@/interfaces/embeds/EmbedParameters';
import { APIEmbed, EmbedBuilder } from 'discord.js';

export function toAPIEmbed(parameters: EmbedParameters): APIEmbed | undefined {
   if (
      parameters.title == null &&
      parameters.description == null &&
      parameters.author_text == null &&
      parameters.footer_text == null
   )
      return undefined;
   const embed = new EmbedBuilder().toJSON();
   if (parameters.author_text)
      embed.author = {
         name: parameters.author_text,
         url: parameters.author_url ?? undefined,
         icon_url: parameters.author_icon ?? undefined,
      };
   if (parameters.description) embed.description = parameters.description;
   if (parameters.title) embed.title = parameters.title;
   if (parameters.title_url) embed.url = parameters.title_url;
   if (parameters.color)
      embed.color =
         typeof parameters.color == 'number'
            ? parameters.color
            : parseInt('0x' + parameters.color.replaceAll('#', ''), 16);

   if (parameters.footer_text)
      embed.footer = { text: parameters.footer_text, icon_url: parameters.footer_icon ?? undefined };
   embed.fields = parameters.fields;
   embed.thumbnail = parameters.thumbnail_url
      ? {
           url: parameters.thumbnail_url,
        }
      : undefined;
   embed.image = parameters.image_url
      ? {
           url: parameters.image_url,
        }
      : undefined;
   return embed;
}
