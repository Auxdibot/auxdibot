import Modules from '@/constants/bot/commands/Modules';
import { LogNames } from '@/constants/bot/log/LogNames';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';

export const logsActions = <AuxdibotSubcommand>{
   name: 'actions',
   info: {
      module: Modules['Settings'],
      description: 'Get a list of every action Auxdibot can log.',
      usageExample: '/logs actions',
      permission: 'logs.actions',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
      embed.title = '📜 All Log Actions';
      embed.description = Object.values(LogAction).reduce((acc, i) => (acc += `\n**${LogNames[i]}** - \`${i}\``), '');
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
