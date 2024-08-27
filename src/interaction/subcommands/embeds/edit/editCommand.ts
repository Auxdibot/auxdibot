import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import { getMessage } from '@/util/getMessage';
import handleError from '@/util/handleError';
import { isEmbedEmpty } from '@/util/isEmbedEmpty';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';

export const editCommand = <AuxdibotSubcommand>{
   name: 'command',
   group: 'edit',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed edit command (message_id) [...embed parameters]',
      description:
         'Edit an existing Embed using command parameters. (View `/embed parameters` for a detailed description of embed parameters.)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const message_id = interaction.options.getString('message_id', true);
      const guild = interaction.data.guild;
      await interaction.deferReply();
      const message = await getMessage(guild, message_id);
      const content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';
      const parameters = argumentsToEmbedParameters(interaction);
      if (!message) return await handleError(auxdibot, 'MESSAGE_NOT_FOUND', "Couldn't find that message!", interaction);
      if (message.embeds.length <= 0)
         return await handleError(auxdibot, 'NO_EMBEDS_FOUND', 'No embeds exist on this message!', interaction);
      const sender = guild.members.cache.get(interaction.member.user.id) ?? undefined;
      try {
         const embed = message.embeds[0].toJSON();
         embed.url = parameters.title_url;
         embed.title = parameters.title
            ? await parsePlaceholders(auxdibot, parameters.title, { guild, member: sender })
            : embed.title;
         embed.color = parameters.color
            ? typeof parameters.color == 'number'
               ? parameters.color
               : parseInt('0x' + parameters.color.replaceAll('#', ''), 16)
            : embed.color;
         embed.description = parameters.description
            ? await parsePlaceholders(auxdibot, parameters.description, { guild, member: sender })
            : embed.description;
         embed.author = parameters.author_text
            ? {
                 name: await parsePlaceholders(auxdibot, parameters.author_text, { guild, member: sender }),
                 ...(parameters.author_url ? { url: parameters.author_url } : {}),
                 ...(parameters.author_icon ? { iconURL: parameters.author_icon } : {}),
              }
            : embed.author;
         embed.fields = parameters.fields || embed.fields;
         embed.footer = parameters.footer_text
            ? {
                 text: await parsePlaceholders(auxdibot, parameters.footer_text, { guild, member: sender }),
                 ...(parameters.footer_icon ? { iconURL: parameters.footer_icon } : {}),
              }
            : embed.footer;
         embed.image = parameters.image_url
            ? { url: await parsePlaceholders(auxdibot, parameters.image_url, { guild, member: sender }) }
            : embed.image;
         embed.thumbnail = parameters.thumbnail_url
            ? { url: await parsePlaceholders(auxdibot, parameters.thumbnail_url, { guild, member: sender }) }
            : embed.thumbnail;

         await message.edit({
            ...(content ? { content: await parsePlaceholders(auxdibot, content, { guild, member: sender }) } : {}),
            embeds: embed && !isEmbedEmpty(embed as never) ? [embed] : undefined,
         });
      } catch (x) {
         return await handleError(
            auxdibot,
            'FAILED_EMBED_EDIT',
            'There was an error editing that embed! (Auxdibot cannot edit that message, or the embed specified is invalid!)',
            interaction,
         );
      }
      const success_embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      success_embed.title = 'Success!';
      success_embed.description = `Edited embed in ${message.channel}.`;
      return await auxdibot.createReply(interaction, { embeds: [success_embed] });
   },
};
