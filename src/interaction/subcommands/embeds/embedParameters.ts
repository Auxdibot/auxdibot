import { CustomEmojis } from '@/constants/bot/CustomEmojis';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from 'discord.js';

export const embedParameters = <AuxdibotSubcommand>{
   name: 'parameters',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed parameters',
      description: 'View the Embed parameters used to build Discord Embeds.',
      allowedDefault: true,
      global: true,
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      embed.title = `${CustomEmojis.MESSAGES} Embed Parameters`;
      embed.url = `https://docs.auxdibot.xyz/modules/embeds/#embed-parameters`;
      embed.description = `Below are parameters used to build Discord Embeds with Auxdibot, filling the position of the \`...embed parameters\` in any command.`;
      embed.fields = [
         {
            name: 'Color (`color`)',
            value: 'A color represented by a HEX code.',
         },
         {
            name: 'Title (`title`)',
            value: 'The title of the embed.',
         },
         {
            name: 'Description (`description`)',
            value: 'The description of the embed.',
         },
         {
            name: 'Footer Text (`footer_text`)',
            value: 'The text for the footer of the embed.',
         },
         {
            name: 'Author Text (`author_text`)',
            value: 'The text for the author of the embed.',
         },
         {
            name: 'Author Icon URL (`author_icon_url`)',
            value: 'A URL pointing to the image for the author of the embed.',
         },
         {
            name: 'Footer Icon URL (`footer_icon_url`)',
            value: "A URL pointing to the image for the embed's footer.",
         },
         {
            name: 'Image URL (`image_url`)',
            value: 'A URL pointing to the image for the embed.',
         },
         {
            name: 'Thumbnail URL (`thumbnail_url`)',
            value: 'A URL pointing to the image for the thumbnail of the embed. (small image at the top right)',
         },
         {
            name: 'Title URL (`title_url`)',
            value: 'A URL that will be used for the title, that will redirect users when clicked.',
         },
         {
            name: 'Author URL (`author_url`)',
            value: 'A URL that will be used for the author, that will redirect users when clicked.',
         },
         {
            name: 'Fields (`fields`)',
            value: "The Embed Fields for the Embed. For commands that use Auxdibot's embed creation parameters, there is a fields parameter. For every field, use |d| to seperate field titles from their descriptions, and |s| to seperate fields. \n**Fields Example**:\n`Field 1|d|Field description for Field 1...|s|Field 2|d|Field description for Field 2...`",
         },
      ];
      return await auxdibot.createReply(interaction, {
         embeds: [embed],
         ephemeral: true,
      });
   },
};
