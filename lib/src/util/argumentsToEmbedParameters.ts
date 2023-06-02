import { EmbedField } from 'discord.js';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import EmbedParameters from '@/interfaces/embeds/EmbedParameters';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';

export default function argumentsToEmbedParameters(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
   const fields = interaction.options.getString('fields')?.replace(/\\n/g, '\n') || null;
   return <EmbedParameters>{
      color: interaction.options.getString('color') || null,
      title: interaction.options.getString('title')?.replace(/\\n/g, '\n') || null,
      title_url: interaction.options.getString('title_url') || null,
      description: interaction.options.getString('description')?.replace(/\\n/g, '\n') || null,
      author_text: interaction.options.getString('author_text')?.replace(/\\n/g, '\n') || null,
      author_url: interaction.options.getString('author_url') || null,
      author_icon: interaction.options.getString('author_icon_url') || null,
      fields: fields
         ? fields.split('|s|').map(
              (field) =>
                 <EmbedField>{
                    name: field.split('|d|')[0].replace(/\\n/g, '\n'),
                    value: field.split('|d|')[1].replace(/\\n/g, '\n'),
                 },
           )
         : undefined,
      footer_text: interaction.options.getString('footer_text')?.replace(/\\n/g, '\n') || null,
      footer_icon: interaction.options.getString('footer_icon_url') || null,
      thumbnail_url: interaction.options.getString('thumbnail_url') || null,
      image_url: interaction.options.getString('image_url') || null,
   };
}
