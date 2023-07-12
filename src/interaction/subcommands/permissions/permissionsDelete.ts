import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';

export const permissionsDelete = <AuxdibotSubcommand>{
   name: 'delete',
   info: {
      module: Modules['Permissions'],
      description: 'Delete a permission override.',
      usageExample: '/permissions delete (override_id)',
      permission: 'permissions.delete',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const override_id = interaction.options.getNumber('override_id', true);
      const server = interaction.data.guildData;
      const permission = server.permission_overrides[override_id - 1];
      if (!permission) {
         return await handleError(
            auxdibot,
            'PERMISSION_OVERRIDE_NOT_FOUND',
            "This permission override doesn't exist!",
            interaction,
         );
      }
      server.permission_overrides.splice(override_id - 1, 1);
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { permission_overrides: server.permission_overrides },
      });
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '✋ Deleted Permission Override';
      embed.description = `Deleted permission override with override id \`${override_id}\`.`;
      embed.fields = [
         {
            name: 'Permission Override',
            value: `${permission.allowed ? '✅' : '❎'} \`${permission.permission}\` - ${
               permission.roleID ? `<@&${permission.roleID}>` : permission.userID ? `<@${permission.userID}>` : ''
            }`,
         },
      ];
      await handleLog(
         auxdibot,
         interaction.data.guild,
         {
            type: LogAction.PERMISSION_DELETED,
            date_unix: Date.now(),
            userID: interaction.user.id,
            description: `${interaction.user.username} deleted a permission override. (OID: ${override_id})`,
         },
         [
            {
               name: 'Permission Override',
               value: `${permission.allowed ? '✅' : '❎'} \`${permission.permission}\` - ${
                  permission.roleID ? `<@&${permission.roleID}>` : permission.userID ? `<@${permission.userID}>` : ''
               }`,
               inline: false,
            },
         ],
      );
      return await interaction.reply({ embeds: [embed] });
   },
};
