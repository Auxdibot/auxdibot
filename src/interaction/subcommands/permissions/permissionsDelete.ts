import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import deletePermissionOverride from '@/modules/features/permissions/deletePermissionOverride';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const permissionsDelete = <AuxdibotSubcommand>{
   name: 'delete',
   info: {
      module: Modules['Permissions'],
      description: 'Delete a permission override.',
      usageExample: '/permissions delete (override_id)',
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
      deletePermissionOverride(auxdibot, interaction.guild, interaction.user, override_id - 1)
         .then(async () => {
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
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch(() =>
            handleError(
               auxdibot,
               'PERMISSION_OVERRIDE_DELETE_ERROR',
               "Couldn't delete that permission override!",
               interaction,
            ),
         );
   },
};
