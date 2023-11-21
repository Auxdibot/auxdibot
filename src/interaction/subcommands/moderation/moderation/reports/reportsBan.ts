import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import canExecute from '@/util/canExecute';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const reportsBan = <AuxdibotSubcommand>{
   name: 'ban',
   group: 'reports',
   info: {
      module: Modules['Moderation'],
      description: 'Ban a user from making reports.',
      usageExample: '/moderation reports ban (user)',
      permission: 'moderation.reports.ban',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true);
      const member = interaction.data.guild.members.cache.get(user.id);
      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);
      if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      await auxdibot.database.servermembers.upsert({
         where: { serverID_userID: { serverID: interaction.data.guild.id, userID: user.id } },
         update: { reports_banned: true },
         create: { serverID: interaction.data.guild.id, userID: user.id },
      });
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.title = 'Success!';
      successEmbed.description = `<@${user.id}> has been banned from reporting.`;
      return await interaction.reply({ embeds: [successEmbed] });
   },
};
