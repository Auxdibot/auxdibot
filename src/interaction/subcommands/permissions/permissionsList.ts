import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from 'discord.js';

export const permissionsList = <AuxdibotSubcommand>{
   name: 'list',
   info: {
      module: Modules['Permissions'],
      description: 'List all permission overrides.',
      usageExample: '/permissions list',
      permission: 'permissions.list',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
      embed.title = '✋ Permission Overrides';
      embed.description = 'Use the OID to delete or view a permission override.';
      embed.fields = [
         {
            name: `Permission Overrides for ${interaction.data.guild.name}`,
            value: server.permission_overrides.reduce(
               (accumulator, permissionOverride, index) =>
                  accumulator +
                  `\n**OID ${index + 1}**) ${permissionOverride.allowed ? '✅' : '❎'} \`${
                     permissionOverride.permission
                  }\` - ${
                     permissionOverride.roleID
                        ? `<@&${permissionOverride.roleID}>`
                        : permissionOverride.userID
                        ? `<@${permissionOverride.userID}>`
                        : ''
                  }`,
               '',
            ),
         },
      ];
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
