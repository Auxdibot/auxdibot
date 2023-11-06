import Modules from '@/constants/bot/commands/Modules';
import { LogNames } from '@/constants/bot/log/LogNames';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const logsListFiltered = <AuxdibotSubcommand>{
   name: 'list_filtered',
   info: {
      module: Modules['Settings'],
      description: 'List every filtered log action.',
      usageExample: '/logs list_filtered',
      permission: 'logs.list_filtered',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
      embed.title = '❌ Filtered Logs';
      embed.description = server.filtered_logs.reverse().reduce((str, log) => `${str}\n**${LogNames[log]}**`, '\u2800');
      return await interaction.reply({ embeds: [embed] });
   },
};
