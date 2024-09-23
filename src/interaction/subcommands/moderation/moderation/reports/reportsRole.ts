import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setReportRole from '@/modules/features/moderation/reports/setReportsRole';
import handleError from '@/util/handleError';
import { testDiscordRolePermission } from '@/util/testDiscordRolePermission';
import { EmbedBuilder } from '@discordjs/builders';

export const reportsRole = <AuxdibotSubcommand>{
   name: 'role',
   group: 'reports',
   info: {
      module: Modules['Moderation'],
      description: 'Change the reports role for this server.',
      usageExample: '/moderation reports role [role]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const role = interaction.options.getRole('role');
      const server = interaction.data.guildData;
      if (
         interaction.data.member.id != interaction.data.guild.ownerId &&
         (await testDiscordRolePermission(auxdibot, interaction, role)) == false
      ) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This role is higher than yours!`;
         return await auxdibot.createReply(interaction, {
            embeds: [noPermissionEmbed],
            ephemeral: true,
         });
      }
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Reports Role Change';
      if (role && role.id == server.report_role) {
         embed.description = `Nothing changed. Reports role is the same as one specified in settings.`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }
      const formerRole = interaction.data.guild.roles.cache.get(server.report_role || '');
      setReportRole(auxdibot, interaction.guild, interaction.user, role)
         .then(async () => {
            embed.description = `The report role for this server has been changed.\r\n\r\nFormerly: ${
               formerRole ? `<@&${formerRole.id}>` : 'None'
            }\r\n\r\nNow: ${role ? `<@&${role.id}>` : 'None'}`;
            return await auxdibot.createReply(interaction, {
               embeds: [embed],
            });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'ERROR_SET_REPORTS_ROLE',
               typeof x.message == 'string' ? x.message : "couldn't set the reports role",
               interaction,
            );
         });
   },
};
