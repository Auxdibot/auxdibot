import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createPermissionOverride from '@/modules/features/permissions/createPermissionOverride';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

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
      createPermissionOverride(auxdibot, interaction.guild, interaction.user, permissionOverride)
         .then(async () => {
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

            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) =>
            handleError(
               auxdibot,
               'PERMISSION_OVERRIDE_CREATE_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't create that permission override!",
               interaction,
            ),
         );
   },
};
