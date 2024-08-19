import Modules from '@/constants/bot/commands/Modules';
import { LogNames } from '@/constants/bot/log/LogNames';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

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
         const name = LogNames[log.type];
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
