import { CustomEmojis } from '@/constants/bot/CustomEmojis';
import Modules from '@/constants/bot/commands/Modules';
import { SettingsEmbeds } from '@/constants/bot/commands/SettingsEmbeds';
import { promoRow } from '@/constants/bot/promoRow';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export const settingsView = <AuxdibotSubcommand>{
   name: 'view',
   info: {
      module: Modules['Settings'],
      description: 'View all settings for the server.',
      usageExample: '/settings view',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const card = auxdibot.database.servercards.findFirst({ where: { serverID: server.serverID } });

      const modulesRow = new ActionRowBuilder<StringSelectMenuBuilder>()
         .addComponents(
            new StringSelectMenuBuilder()
               .setCustomId('settings')
               .setMaxValues(1)
               .setPlaceholder('Select a module to view settings...')
               .addOptions(
                  {
                     value: 'general',
                     label: 'Settings',
                     description: 'General settings for Auxdibot.',
                     emoji: CustomEmojis.SETTINGS,
                  },
                  {
                     value: 'moderation',
                     label: 'Moderation',
                     description: "Settings for Auxdibot's moderation features.",
                     emoji: CustomEmojis.MODERATION,
                  },
                  {
                     value: 'messages',
                     label: 'Messages',
                     description: 'Settings for Scheduled Messages and Notification Feeds.',
                     emoji: CustomEmojis.MESSAGES,
                  },
                  {
                     value: 'greetings',
                     label: 'Greetings',
                     description: "Settings for Auxdibot's greeting messages.",
                     emoji: CustomEmojis.GREETINGS,
                  },
                  {
                     value: 'roles',
                     label: 'Roles',
                     description: 'Settings for Join Roles, Reaction Roles and Sticky Roles.',
                     emoji: CustomEmojis.ROLES,
                  },
                  {
                     value: 'levels',
                     label: 'Levels',
                     description: "Settings for Auxdibot's leveling system.",
                     emoji: CustomEmojis.LEVELS,
                  },
                  {
                     value: 'suggestions',
                     label: 'Suggestions',
                     description: "Settings for Auxdibot's suggestion system.",
                     emoji: CustomEmojis.SUGGESTIONS,
                  },
                  {
                     value: 'starboard',
                     label: 'Starboard',
                     description: "Settings for Auxdibot's starboard system.",
                     emoji: CustomEmojis.STARBOARD,
                  },
               ),
         )
         .toJSON();
      return await auxdibot.createReply(interaction, {
         embeds: [SettingsEmbeds['general'](auxdibot, server, card)],
         components: [modulesRow, promoRow],
      });
   },
};
