import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';
import { LogData } from '@/constants/bot/log/LogData';

export const logsListFiltered = <AuxdibotSubcommand>{
   name: 'list_filtered',
   info: {
      module: Modules['Settings'],
      description: 'List every filtered log action.',
      usageExample: '/logs list_filtered',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
      embed.title = '❌ Filtered Logs';
      embed.description = server.filtered_logs
         .reverse()
         .reduce((str, log) => `${str}\n**${LogData[log].name}**`, '\u2800');
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
