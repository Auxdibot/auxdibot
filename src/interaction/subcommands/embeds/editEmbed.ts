import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import { getMessage } from '@/util/getMessage';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';

export const editEmbed = <AuxdibotSubcommand>{
   name: 'edit',
   info: {
      module: Modules['Messages'],
      usageExample:
         '/embed edit (message_id) [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
      description: 'Edit an existing Embed by Auxdibot.',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const message_id = interaction.options.getString('message_id', true);
      const guild = interaction.data.guild;
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
            ? await parsePlaceholders(auxdibot, parameters.title, guild, sender)
            : embed.title;
         embed.color = parameters.color
            ? typeof parameters.color == 'number'
               ? parameters.color
               : parseInt('0x' + parameters.color.replaceAll('#', ''), 16)
            : embed.color;
         embed.description = parameters.description
            ? await parsePlaceholders(auxdibot, parameters.description, guild, sender)
            : embed.description;
         embed.author = parameters.author_text
            ? {
                 name: await parsePlaceholders(auxdibot, parameters.author_text, guild, sender),
                 ...(parameters.author_url ? { url: parameters.author_url } : {}),
                 ...(parameters.author_icon ? { iconURL: parameters.author_icon } : {}),
              }
            : embed.author;
         embed.fields = parameters.fields || embed.fields;
         embed.footer = parameters.footer_text
            ? {
                 text: await parsePlaceholders(auxdibot, parameters.footer_text, guild, sender),
                 ...(parameters.footer_icon ? { iconURL: parameters.footer_icon } : {}),
              }
            : embed.footer;
         embed.image = parameters.image_url
            ? { url: await parsePlaceholders(auxdibot, parameters.image_url, guild, sender) }
            : embed.image;
         embed.thumbnail = parameters.thumbnail_url
            ? { url: await parsePlaceholders(auxdibot, parameters.thumbnail_url, guild, sender) }
            : embed.thumbnail;

         await message.edit({
            ...(content ? { content: await parsePlaceholders(auxdibot, content, guild, sender) } : {}),
            embeds: [embed],
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
