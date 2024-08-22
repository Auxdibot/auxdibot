import { CustomEmojis } from '@/constants/bot/CustomEmojis';
import { PlaceholderData } from '@/constants/embeds/PlaceholderData';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { BuildSession } from '@/interfaces/messages/BuildSession';
import { isEmbedEmpty } from '@/util/isEmbedEmpty';
import parsePlaceholders from '@/util/parsePlaceholder';
import {
   ActionRowBuilder,
   APIEmbed,
   BaseInteraction,
   ButtonBuilder,
   ButtonStyle,
   Message,
   StringSelectMenuBuilder,
   StringSelectMenuOptionBuilder,
} from 'discord.js';

export async function createEmbedBuilder(
   auxdibot: Auxdibot,
   interaction: BaseInteraction,
   id: string,
   message?: Message,
   session?: BuildSession,
) {
   async function sendEmbed(content?: string, embed?: APIEmbed) {
      const parsedEmbed =
         embed &&
         JSON.parse(
            await parsePlaceholders(auxdibot, JSON.stringify(embed), {
               ...PlaceholderData,
               guild: interaction.guild,
               member: interaction.user,
            }).catch(() => JSON.stringify(embed)),
         );
      const parsedContent =
         content &&
         (await parsePlaceholders(auxdibot, content, {
            ...PlaceholderData,
            guild: interaction.guild,
            member: interaction.user,
         }).catch(() => content));
      const opts = {
         content: `## ${
            CustomEmojis.MESSAGES
         } **Embed Builder**\n\n-# Use the buttons below to reset the embed, view the placeholders list, or submit the embed. Select an embed component to modify using the dropdown menu below.\n\`\`\`‎\`\`\`\n${
            parsedContent ?? ''
         }\n${parsedEmbed ? '' : '*No Embed Content*'}`,
         embeds: parsedEmbed ? [parsedEmbed] : undefined,
         components: [row.toJSON(), selectRow.toJSON(), fieldsRow.toJSON()],
      };
      return await (message ? message.edit(opts) : auxdibot.createReply(interaction, opts));
   }
   const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`embedclose-${id}`).setLabel('Close').setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
         .setCustomId(`placeholders`)
         .setEmoji(CustomEmojis.LOGGING)
         .setLabel('Placeholders List')
         .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
         .setCustomId(`embedfetch-${id}`)
         .setEmoji(CustomEmojis.LINK)
         .setLabel('Fetch Embed')
         .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
         .setCustomId(`embedsubmit-${id}`)
         .setEmoji(CustomEmojis.MESSAGES)
         .setLabel('Store')
         .setStyle(ButtonStyle.Primary),
   );
   const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
         .setCustomId(`embedmodify-${id}`)
         .setPlaceholder('Select an embed component to modify.')
         .setOptions(
            new StringSelectMenuOptionBuilder()
               .setLabel('Message Content')
               .setValue('content')
               .setDescription('The message content paired with the embed.'),
            new StringSelectMenuOptionBuilder()
               .setLabel('Title')
               .setValue('title')
               .setDescription('The title of the embed.'),
            new StringSelectMenuOptionBuilder()
               .setLabel('Description')
               .setValue('description')
               .setDescription('The description of the embed.'),
            new StringSelectMenuOptionBuilder()
               .setLabel('Color')
               .setValue('color')
               .setDescription('The color of the embed.'),
            new StringSelectMenuOptionBuilder()
               .setLabel('Footer')
               .setValue('footer')
               .setDescription('The footer of the embed.'),
            new StringSelectMenuOptionBuilder()
               .setLabel('Image')
               .setValue('image')
               .setDescription('The image of the embed.'),
            new StringSelectMenuOptionBuilder()
               .setLabel('Thumbnail')
               .setValue('thumbnail')
               .setDescription('The thumbnail of the embed.'),
            new StringSelectMenuOptionBuilder()
               .setLabel('Author')
               .setValue('author')
               .setDescription('The author of the embed.'),
         ),
   );
   const fieldsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
         .setCustomId(`removefield-${id}`)
         .setEmoji('➖')
         .setLabel('Remove Field')
         .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
         .setCustomId(`dummy`)
         .setEmoji(CustomEmojis.DOCS)
         .setLabel(`${session?.embed?.fields?.length ?? 0}/25 Fields`)
         .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
         .setCustomId(`addfield-${id}`)
         .setEmoji('➕')
         .setLabel('Add Field')
         .setStyle(ButtonStyle.Secondary),
   );
   return await sendEmbed(
      session?.content,
      session?.embed && !isEmbedEmpty(session.embed as never) ? (session.embed as APIEmbed) : undefined,
   )
      .then(async (res) => {
         let ctx = res;
         if (ctx && 'interaction' in ctx && 'replied' in ctx.interaction) {
            ctx = await ctx.interaction.fetchReply().catch(() => undefined);
         }
         if (ctx && 'guildId' in ctx) {
            auxdibot.build_sessions.set(`${ctx.guildId}:${ctx.channelId}:${ctx.id}`, {
               embed: session?.embed ?? null,
               content: session?.content ?? '',
               last_interaction: new Date(),
               userID: interaction.user.id,
            });
         }
      })
      .catch((x) => {
         console.error(x);
         sendEmbed(undefined, {
            title: '⚠️ ERROR ⚠️',
            description:
               'An error occurred while trying to send the embed. Please edit your configuration and try again.',
         });
      });
}
