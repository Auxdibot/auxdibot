import Modules from '@/constants/bot/commands/Modules';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const punishmentLatest = <AuxdibotSubcommand>{
   name: 'latest',
   info: {
      module: Modules['Moderation'],
      description: 'View the last 10 punishments.',
      usageExample: '/punishment latest',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const punishments = server.punishments.reverse().slice(0, 10);
      const embed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
      embed.title = '🔨 Latest Punishments';
      embed.fields = [
         {
            name: `Latest Punishments on ${interaction.data.guild.name}`,
            value: punishments.reduce((str, punishment) => {
               const type = PunishmentValues[punishment.type];
               return (
                  str +
                  `\n**${type.name}** - PID: ${punishment.punishmentID} - <t:${Math.round(
                     punishment.date.valueOf() / 1000,
                  )}> (<@${punishment.userID}>)`
               );
            }, '\u2800'),
         },
      ];
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
