import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const setupModeration = <AuxdibotSubcommand>{
   name: 'moderation',
   info: {
      module: Modules['Settings'],
      description: 'Auxdibot will be automatically configure Moderation for your server.',
      usageExample: '/setup moderation',
   },
   async execute(_, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const modal = new ModalBuilder().setCustomId('moderation').setTitle('Setup Moderation');

      const moderationMute = new TextInputBuilder()
         .setCustomId('moderation_mute')
         .setLabel('Name of Mute Role')
         .setRequired(false)
         .setPlaceholder("Leave empty to use Discord's timeout system.")
         .setStyle(TextInputStyle.Short);
      const moderationRole = new TextInputBuilder()
         .setCustomId('moderation_role')
         .setLabel('Name of Moderator Role')
         .setPlaceholder('Moderator')
         .setRequired(false)
         .setValue('Moderator')
         .setStyle(TextInputStyle.Short);
      const moderationWarns = new TextInputBuilder()
         .setCustomId('moderation_warns')
         .setLabel('User Warns before issued Mute')
         .setPlaceholder('Leave empty to leave Warn Threshold unset.')
         .setRequired(false)
         .setValue('3')
         .setStyle(TextInputStyle.Short);
      const moderationReports = new TextInputBuilder()
         .setCustomId('moderation_reports')
         .setLabel('Channel name for Reports')
         .setPlaceholder('auxdibot-reports')
         .setRequired(false)
         .setValue('auxdibot-reports')
         .setStyle(TextInputStyle.Short);
      const moderationLogs = new TextInputBuilder()
         .setCustomId('moderation_logs')
         .setLabel('Channel name for Logs')
         .setPlaceholder('auxdibot-logs')
         .setRequired(false)
         .setValue('auxdibot-logs')
         .setStyle(TextInputStyle.Short);

      modal.addComponents(
         new ActionRowBuilder<TextInputBuilder>().addComponents(moderationMute),
         new ActionRowBuilder<TextInputBuilder>().addComponents(moderationReports),
         new ActionRowBuilder<TextInputBuilder>().addComponents(moderationRole),
         new ActionRowBuilder<TextInputBuilder>().addComponents(moderationWarns),
         new ActionRowBuilder<TextInputBuilder>().addComponents(moderationLogs),
      );

      await interaction.showModal(modal);
      return;
   },
};
