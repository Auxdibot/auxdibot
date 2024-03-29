import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createCommandListEmbed } from '@/modules/features/commands/createCommandListEmbed';
export default <AuxdibotSubcommand>{
   name: 'view',
   group: 'rules',
   info: {
      module: Modules['Settings'],
      description: 'View the rules for a command.',
      usageExample: '/commands rules view',
   },
   execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.guild) return;

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
         new ButtonBuilder().setEmoji('◀️').setCustomId('rules-0').setStyle(ButtonStyle.Secondary),
         new ButtonBuilder()
            .setLabel(`1/${Math.ceil(interaction.data.guildData.command_permissions.length / 5)}`)
            .setStyle(ButtonStyle.Primary)
            .setCustomId('none'),
         new ButtonBuilder().setEmoji('▶️').setCustomId('rules-5').setStyle(ButtonStyle.Secondary),
      );
      return auxdibot.createReply(interaction, {
         embeds: [createCommandListEmbed(auxdibot, interaction.data.guildData.command_permissions.slice(0, 5))],
         components: [row.toJSON()],
      });
   },
};
