import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const permissionsView = <AuxdibotSubcommand>{
   name: 'view',
   info: {
      module: Modules['Permissions'],
      description: 'View a permission override.',
      usageExample: '/permissions view (override_id)',
      permission: 'permissions.view',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const override_id = interaction.options.getNumber('override_id', true);
      const server = await interaction.data.guildData;
      const permission = server.permission_overrides[override_id - 1];
      if (permission) {
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = `✋ Permission Override (OID: ${override_id})`;
         embed.description = `${permission.allowed ? '✅' : '❎'} \`${permission.permission}\` - ${
            permission.roleID ? `<@&${permission.roleID}>` : permission.userID ? `<@${permission.userID}>` : ''
         }`;
         return await interaction.reply({ embeds: [embed] });
      }
   },
};
