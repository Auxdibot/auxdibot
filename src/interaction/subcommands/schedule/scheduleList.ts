import timestampToDuration from '@/util/timestampToDuration';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const scheduleList = <AuxdibotSubcommand>{
   name: 'list',
   info: {
      module: Modules['Messages'],
      description: 'List the schedules running on your server.',
      usageExample: '/schedule list',
      permission: 'schedule.list',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      const server = interaction.data.guildData;
      successEmbed.title = '⏲️ Schedules';
      successEmbed.description = server.scheduled_messages.reduce(
         (accumulator: string, value, index) =>
            `${accumulator}\r\n\r\n**${index + 1})** Channel: <#${value.channelID}> (next run <t:${Math.round(
               (value.last_run.valueOf() + (Number(timestampToDuration(value.interval_timestamp)) || 0)) / 1000,
            )}:R>)`,
         '',
      );
      return await interaction.reply({ embeds: [successEmbed] });
   },
};
