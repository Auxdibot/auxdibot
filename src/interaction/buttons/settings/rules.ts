import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { createCommandListEmbed } from '@/modules/features/commands/createCommandListEmbed';

export default <AuxdibotButton>{
   module: Modules['Settings'],
   name: 'rules',
   command: 'commands rules view',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      const [, index] = interaction.customId.split('-');
      const server = await findOrCreateServer(auxdibot, interaction.guildId);
      const commands = server.command_permissions.slice(Number(index)).splice(0, 5);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
         new ButtonBuilder()
            .setEmoji('◀️')
            .setCustomId(`rules-${Number(index) - 5 <= 0 ? 0 : Number(index) - 5}`)
            .setStyle(ButtonStyle.Secondary),
         new ButtonBuilder()
            .setLabel(`${Math.floor(Number(index) / 5) + 1}/${Math.ceil(server.command_permissions.length / 5)}`)
            .setStyle(ButtonStyle.Primary)
            .setCustomId('none'),
         new ButtonBuilder()
            .setEmoji('▶️')
            .setCustomId(
               `rules-${
                  Number(index) + 5 >= server.command_permissions.length
                     ? server.command_permissions.length - (server.command_permissions.length % 5)
                     : Number(index) + 5
               }`,
            )
            .setStyle(ButtonStyle.Secondary),
      );
      interaction.message
         .edit({
            embeds: [createCommandListEmbed(auxdibot, commands)],
            components: [row],
         })
         .catch(() => undefined);
      return interaction
         .deferReply()
         .then(() => interaction.deleteReply())
         .catch(() => undefined);
   },
};
