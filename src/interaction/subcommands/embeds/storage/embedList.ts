import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { isEmbedEmpty } from '@/util/isEmbedEmpty';
import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';

export const embedList = <AuxdibotSubcommand>{
   name: 'list',
   group: 'storage',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed storage list',
      description: 'List every stored embed in the server.',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      await interaction.deferReply();

      const server = interaction.data.guildData;

      const embed = new EmbedBuilder().setColor(auxdibot.colors.info).setTitle('📝 Embeds List');

      embed.setDescription(
         'This is a list of every embed stored on your server. You can use the ID of the embed to reference it in commands like `/levels message set` or `join message`. You can preview an Embed using the dropdown menu below.\n\n' +
            (server.stored_embeds.length > 0
               ? server.stored_embeds
                    .map((embed, index) => {
                       return `**${index + 1})** \`${embed.id}\`\n🕰️ Date Created: <t:${Math.round(
                          embed.date_created.valueOf() / 1000,
                       )}>\n${
                          embed.embed && !isEmbedEmpty(embed.embed)
                             ? embed.content
                                ? '📖 Contains Embed & Content'
                                : '📝 Contains Embed'
                             : '💬 Contains Content'
                       }\n${embed.webhook_url ? `[Webhook URL](${embed.webhook_url})` : ''}`;
                    })
                    .join('\n\n')
               : '*No embeds have been stored on this server.*'),
      );

      const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
         new StringSelectMenuBuilder()
            .setCustomId('preview')
            .setOptions(
               server.stored_embeds.map((embed) => {
                  return {
                     label: embed.id,
                     value: embed.id,
                     description: `Preview the embed ${embed.id}`,
                  };
               }),
            )
            .setPlaceholder('Select an embed to preview')
            .setMaxValues(1),
      );
      return await auxdibot
         .createReply(interaction, {
            embeds: [embed],
            components: server.stored_embeds.length > 0 ? [selectRow] : undefined,
         })
         .catch(() => {
            return handleError(
               auxdibot,
               'EMBED_LIST_ERROR',
               'There was an error fetching the list of embeds!',
               interaction,
            );
         });
   },
};
