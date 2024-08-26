import { ActionRowBuilder, AnySelectMenuInteraction, APIEmbed, ButtonBuilder, ButtonStyle } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';
import AuxdibotSelectMenu from '@/interfaces/menus/AuxdibotSelectMenu';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { isEmbedEmpty } from '@/util/isEmbedEmpty';

export default <AuxdibotSelectMenu>{
   module: Modules['Messages'],
   name: 'preview',
   command: 'embed list',
   async execute(auxdibot: Auxdibot, interaction: AnySelectMenuInteraction) {
      if (!interaction.guild || !interaction.member || !interaction.channel || !interaction.isStringSelectMenu())
         return;

      const server = await findOrCreateServer(auxdibot, interaction.guildId);
      await interaction.deferReply({ ephemeral: true });

      const embedId = interaction.values[0];
      const embed = server.stored_embeds.find((embed) => embed.id === embedId);
      const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
         new ButtonBuilder().setCustomId(`dummy`).setLabel('Embed Preview').setStyle(ButtonStyle.Secondary),
      );
      if (interaction.message.editable)
         await interaction.message.edit({ components: [interaction.message.components[0]] }).catch(() => undefined);
      return await auxdibot
         .createReply(interaction, {
            embeds: embed?.embed && !isEmbedEmpty(embed.embed) ? [embed.embed as APIEmbed] : undefined,
            components: [button],
            content: embed.content ?? '',
            ephemeral: true,
         })
         .catch(() => {
            return handleError(
               auxdibot,
               'EMBED_PREVIEW_ERROR',
               'There was an error attempting to preview the embed!',
               interaction,
            );
         });
   },
};
