import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const setupLevels = <AuxdibotSubcommand>{
   name: 'levels',
   info: {
      module: Modules['Settings'],
      description: 'Auxdibot will be automatically configure Levels for your server.',
      usageExample: '/setup levels',
   },
   async execute(_, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const modal = new ModalBuilder().setCustomId('levels').setTitle('Setup Levels');

      const messageXP = new TextInputBuilder()
         .setCustomId('levels_message')
         .setLabel('XP per message sent')
         .setPlaceholder('ex. "10" "10-30", "30"')
         .setRequired(true)
         .setValue('10-30')
         .setStyle(TextInputStyle.Short);
      const eventXP = new TextInputBuilder()
         .setCustomId('levels_event')
         .setLabel('XP per event joined')
         .setPlaceholder('ex. "10" "10-30", "30"')
         .setRequired(true)
         .setValue('0')
         .setStyle(TextInputStyle.Short);
      const voiceXP = new TextInputBuilder()
         .setCustomId('levels_voice')
         .setLabel('XP per minute in voice')
         .setPlaceholder('ex. "10" "10-30", "30"')
         .setRequired(true)
         .setValue('0')
         .setStyle(TextInputStyle.Short);
      const starboardXP = new TextInputBuilder()
         .setCustomId('levels_starboard')
         .setLabel('XP per starboard message')
         .setPlaceholder('ex. "10" "10-30", "30"')
         .setRequired(true)
         .setValue('0')
         .setStyle(TextInputStyle.Short);
      const levelupChannel = new TextInputBuilder()
         .setCustomId('levels_channel')
         .setLabel('Levelup Announcement Channel')
         .setPlaceholder('Leave empty to reply to messages with levelup.')
         .setRequired(false)
         .setStyle(TextInputStyle.Short);
      modal.addComponents(
         new ActionRowBuilder<TextInputBuilder>().addComponents(messageXP),
         new ActionRowBuilder<TextInputBuilder>().addComponents(eventXP),
         new ActionRowBuilder<TextInputBuilder>().addComponents(voiceXP),
         new ActionRowBuilder<TextInputBuilder>().addComponents(starboardXP),
         new ActionRowBuilder<TextInputBuilder>().addComponents(levelupChannel),
      );

      await interaction.showModal(modal);
      return;
   },
};
