import Modules from '@/constants/bot/commands/Modules';
import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';

export const permissionsCreate = <AuxdibotSubcommand>{
   name: 'create',
   info: {
      module: Modules['Permissions'],
      description: 'Create a permission override.',
      usageExample: '/permissions create (permission) (role|user) (allowed)',
      permission: 'permissions.create',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user'),
         permission = interaction.options.getString('permission', true),
         role = interaction.options.getRole('role'),
         allowed = interaction.options.getBoolean('allowed', true);
      if (!role && !user) {
         return await handleError(
            auxdibot,
            'NO_PERMISSION_ARGUMENTS',
            'No arguments provided for the role or user!',
            interaction,
         );
      }

      const permissionOverride = {
         userID: user ? user.id : undefined,
         roleID: role ? role.id : undefined,
         permission: permission,
         allowed,
      };
      if (!testLimit(interaction.data.guildData.permission_overrides, Limits.PERMISSION_OVERRIDES_DEFAULT_LIMIT))
         return await handleError(
            auxdibot,
            'PERMISSION_OVERRIDES_LIMIT_EXCEEDED',
            'You have too many permission overrides!',
            interaction,
         );

      await auxdibot.database.servers.update({
         where: { serverID: interaction.data.guildData.serverID },
         data: { permission_overrides: { push: permissionOverride } },
      });
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '✋ Added Permission Override';
      embed.description = `Created a new permission override for ${
         permissionOverride.userID
            ? `<@${permissionOverride.userID}>`
            : permissionOverride.roleID
            ? `<@&${permissionOverride.roleID}>`
            : 'None'
      } for permission \`${permissionOverride.permission}\``;
      embed.fields = [
         {
            name: `Permission Override (OID: ${interaction.data.guildData.permission_overrides.length + 1})`,
            value: `${allowed ? '✅' : '❎'} \`${permissionOverride.permission}\` - ${
               permissionOverride.roleID
                  ? `<@&${permissionOverride.roleID}>`
                  : permissionOverride.userID
                  ? `<@${permissionOverride.userID}>`
                  : ''
            }`,
         },
      ];
      await handleLog(
         auxdibot,
         interaction.data.guild,
         {
            type: LogAction.PERMISSION_CREATED,
            date_unix: Date.now(),
            userID: interaction.user.id,
            description: `${interaction.user.tag} created a permission override. (OID: ${interaction.data.guildData.permission_overrides.length})`,
         },
         [
            {
               name: `Permission Override (OID: ${interaction.data.guildData.permission_overrides.length})`,
               value: `${allowed ? '✅' : '❎'} \`${permissionOverride.permission}\` - ${
                  permissionOverride.roleID
                     ? `<@&${permissionOverride.roleID}>`
                     : permissionOverride.userID
                     ? `<@${permissionOverride.userID}>`
                     : ''
               }`,
               inline: false,
            },
         ],
      );

      return await interaction.reply({ embeds: [embed] });
   },
};
