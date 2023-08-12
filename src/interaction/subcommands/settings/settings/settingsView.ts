import Modules from '@/constants/bot/commands/Modules';
import { promoRow } from '@/constants/bot/promoRow';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const settingsView = <AuxdibotSubcommand>{
   name: 'view',
   info: {
      module: Modules['Settings'],
      description: 'View all settings for the server.',
      usageExample: '/settings view',
      permission: 'settings.view',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      embed.description = `You can edit and view these settings more in-depth on [Auxdibot's Dashboard](https://bot.auxdible.me)\n\n🗒️ **Log Channel**: ${
         server.log_channel ? `<#${server.log_channel}>` : '`None`'
      }
      \r\n📩 **Join/Leave Channel**: ${server.join_leave_channel ? `<#${server.join_leave_channel}>` : '`None`'}
      \r\n🎤 **Mute Role**: ${server.mute_role ? `<@&${server.mute_role}>` : '`None (Timeout)`'}
      \r\n💬 **Message XP**: \`${server.message_xp}\``;
      embed.fields = [
         {
            name: '👋 Join Roles',
            value: server.join_roles.reduce(
               (accumulator: string, val: string, index: number) => `${accumulator}\r\n> **${index + 1})** <@&${val}>`,
               '',
            ),
            inline: true,
         },
         {
            name: '📝 Sticky Roles',
            value: server.sticky_roles.reduce(
               (accumulator: string, val: string, index: number) => `${accumulator}\r\n> **${index + 1})** <@&${val}>`,
               '',
            ),
            inline: true,
         },
         {
            name: '❓ Suggestions',
            value: `> **Channel**: ${
               server.suggestions_channel ? `<#${server.suggestions_channel}>` : '`None (Suggestions are disabled.)`'
            }
              > **Updates Channel**: ${
                 server.suggestions_updates_channel ? `<#${server.suggestions_updates_channel}>` : '`None`'
              }
              > **Auto Delete**: \`${server.suggestions_auto_delete ? 'Delete.' : 'Do not Delete.'}\`
              > **Discussion Threads**: \`${
                 server.suggestions_discussion_threads ? 'Create Thread.' : 'Do not create a Thread.'
              }\``,
         },
         {
            name: '⛔ Disabled Features',
            value: server.disabled_modules.reduce(
               (accumulator: string, val: string) => `${accumulator}\r\n> *${Modules[val]?.name || 'Unknown'}*`,
               '',
            ),
            inline: true,
         },
         {
            name: '🏆 Level Reward Roles',
            value: server.level_rewards.reduce(
               (accumulator: string, val, index: number) =>
                  `${accumulator}\r\n> **${index + 1})** <@&${val.roleID}> (\`Level ${val.level}\`)`,
               '',
            ),
            inline: true,
         },
         {
            name: '⭐ Starboard',
            value: `> **Channel**: ${
               server.starboard_channel ? `<#${server.starboard_channel}>` : '`None (Starboard is disabled.)`'
            }
              > **Reaction**: ${server.starboard_reaction || '`None (Starboard is disabled.)`'}
              > **Reaction Count**: \`${server.starboard_reaction_count}\``,
         },
      ];
      return await interaction.reply({
         content: '# ⚙️ Server Settings',
         embeds: [embed],
         components: [promoRow],
      });
   },
};
