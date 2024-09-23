import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';
import { LogData } from '@/constants/bot/log/LogData';

export const logsLatest = <AuxdibotSubcommand>{
   name: 'latest',
   info: {
      module: Modules['Settings'],
      description: 'Get the latest logs on your server.',
      usageExample: '/logs latest',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
      embed.title = '📜 Latest Logs';
      embed.description = server.logs.reverse().reduce((str, log) => {
         const name = LogData[log.type].name;
         return (
            str +
            `\n**${name}**\n${log.description}\n🕰️ Date: <t:${Math.round(log.date.valueOf() / 1000)}>\n🧍 User: <@${
               log.userID
            }>\n`
         );
      }, '\u2800');
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
