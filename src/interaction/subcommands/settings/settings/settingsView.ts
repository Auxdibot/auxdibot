import { CustomEmojis } from '@/constants/bot/CustomEmojis';
import Modules from '@/constants/bot/commands/Modules';
import { SettingsEmbeds } from '@/constants/bot/commands/SettingsEmbeds';
import { promoRow } from '@/constants/bot/promoRow';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { ActionRowBuilder, ButtonBuilder } from 'discord.js';

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
      const card = auxdibot.database.servercards.findFirst({ where: { serverID: server.serverID } });

      const modulesRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('settings-general')
               .setLabel('Settings')
               .setEmoji(CustomEmojis.BOLT),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('settings-moderation')
               .setLabel('Moderation')
               .setEmoji(CustomEmojis.MODERATION),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('settings-permissions')
               .setLabel('Permissions')
               .setEmoji(CustomEmojis.PERMISSIONS),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('settings-roles')
               .setLabel('Roles')
               .setEmoji(CustomEmojis.ROLES),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('settings-messages')
               .setLabel('Messages')
               .setEmoji(CustomEmojis.MESSAGES),
         ),
         modulesRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('settings-greetings')
               .setLabel('Greetings')
               .setEmoji(CustomEmojis.GREETINGS),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('settings-levels')
               .setLabel('Levels')
               .setEmoji(CustomEmojis.LEVELS),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('settings-suggestions')
               .setLabel('Suggestions')
               .setEmoji(CustomEmojis.SUGGESTIONS),
            new ButtonBuilder()
               .setStyle(1)
               .setCustomId('settings-starboard')
               .setLabel('Starboard')
               .setEmoji(CustomEmojis.STARBOARD),
         );
      return await interaction.reply({
         embeds: [SettingsEmbeds['general'](auxdibot, server, card)],
         components: [modulesRow1, modulesRow2, promoRow],
      });
   },
};
