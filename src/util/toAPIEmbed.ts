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
   const embed = new EmbedBuilder()
      .setColor(
         parameters.color && /(#|)[0-9a-fA-F]{6}/.test(parameters.color)
            ? parseInt('0x' + parameters.color.replaceAll('#', ''), 16)
            : null,
      )
      .setTitle(parameters.title || null)
      .setURL(parameters.title_url || null)
      .setDescription(parameters.description || null)
      .setAuthor(
         parameters.author_text
            ? {
                 name: parameters.author_text,
                 url: parameters.author_url,
                 iconURL: parameters.author_icon,
              }
            : null,
      )
      .setFooter(
         parameters.footer_text
            ? {
                 text: parameters.footer_text,
                 iconURL: parameters.footer_icon,
              }
            : null,
      )
      .toJSON();
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
