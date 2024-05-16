import { SlashCommandSubcommandBuilder } from 'discord.js';

/**
 * Creates embed parameters for a Discord slash command subcommand builder.
 * @param builder - The slash command subcommand builder to add the parameters to.
 * @returns The updated slash command subcommand builder.
 */
export default function createEmbedParameters(builder: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
   return builder
      .addStringOption((option) =>
         option.setName('color').setDescription('The color of the Embed as a HEX color code. (Optional)'),
      )
      .addStringOption((option) => option.setName('title').setDescription('The title of the Embed. (Optional)'))
      .addStringOption((option) =>
         option.setName('title_url').setDescription('The URL for Title of the Embed. (Optional)'),
      )
      .addStringOption((option) =>
         option.setName('content').setDescription('The message content to send with the embed. (Optional)'),
      )
      .addStringOption((option) =>
         option.setName('description').setDescription('The description of the Embed. (Optional)'),
      )
      .addStringOption((option) =>
         option.setName('author_text').setDescription('The author text of the Embed. (Optional)'),
      )
      .addStringOption((option) =>
         option.setName('author_url').setDescription('The URL for the Author of the Embed. (Optional)'),
      )
      .addStringOption((option) =>
         option.setName('author_icon_url').setDescription('The URL of the footer icon for the Embed. (Optional)'),
      )
      .addStringOption((option) =>
         option
            .setName('fields')
            .setDescription('Embed fields. "Title|d|Description|s|Title|d|Description" (Optional)'),
      )
      .addStringOption((option) =>
         option.setName('footer_text').setDescription('The footer text of the Embed. (Optional)'),
      )
      .addStringOption((option) =>
         option.setName('footer_icon_url').setDescription('The URL of the footer icon for the Embed. (Optional)'),
      )
      .addStringOption((option) =>
         option.setName('image_url').setDescription('The URL of the image for the Embed. (Optional)'),
      )
      .addStringOption((option) =>
         option.setName('thumbnail_url').setDescription('The URL of the thumbnail for the Embed. (Optional)'),
      );
}
