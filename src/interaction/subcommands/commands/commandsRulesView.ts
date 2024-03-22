import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { EmbedBuilder } from 'discord.js';
export default <AuxdibotSubcommand>{
   name: 'view',
   group: 'rules',
   info: {
      module: Modules['Settings'],
      description: 'View the rules for a command.',
      usageExample: '/commands rules view',
   },
   execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.guild) return;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      embed.title = 'Command Rules';
      embed.description = interaction.data.guildData.command_permissions
         .map((command) => {
            return `**/${command.command}**\n${
               command.disabled
                  ? '❌ *Disabled*'
                  : `${command.admin_only ? '🛡️ Admin Only' : '👥 Everyone'}${
                       command.blacklist_channels.length
                          ? `\nBlacklisted Channels: ${command.blacklist_channels
                               .map((channel) => `<#${channel}>`)
                               .join(', ')}`
                          : ''
                    }${
                       command.channels.length
                          ? `\nRequired Channels: ${command.channels.map((channel) => `<#${channel}>`).join(', ')}`
                          : ''
                    }${
                       command.blacklist_roles.length
                          ? `\nBlacklisted Roles: ${command.blacklist_roles.map((role) => `<@&${role}>`).join(', ')}`
                          : ''
                    }${
                       command.roles.length
                          ? `\nRequired Roles: ${command.roles.map((role) => `<@&${role}>`).join(', ')}`
                          : ''
                    }${
                       command.permission_bypass_roles.length
                          ? `\nBypass Roles: ${command.permission_bypass_roles.map((role) => `<@&${role}>`).join(', ')}`
                          : ''
                    }${command.channel_output ? `\nOutput Channel: <#${command.channel_output}>` : ''}`
            }`;
         })
         .join('\n\n');
      return interaction.reply({ embeds: [embed] });
   },
};
