import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const leavePreview = <AuxdibotSubcommand>{
   name: 'preview',
   group: 'leave',
   info: {
      module: Modules['Greetings'],
      description: 'Preview the leave message.',
      usageExample: '/greetings leave preview',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const settings = interaction.data.guildData;
      try {
         const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Embed Preview').setCustomId('dummy'),
         );
         return await auxdibot.createReply(interaction, {
            content: `${settings.leave_text || ''}`,
            ...(Object.entries(settings.leave_embed || {}).length != 0
               ? {
                    embeds: [
                       JSON.parse(
                          await parsePlaceholders(auxdibot, JSON.stringify(settings.leave_embed), {
                             guild: interaction.data.guild,
                             member: interaction.data.member,
                          }),
                       ),
                    ],
                 }
               : {}),
            components: [row],
            ephemeral: true,
         });
      } catch (x) {
         return await handleError(
            auxdibot,
            'INVALID_LEAVE_EMBED',
            'This is an invalid embed! This will not be able to send when a user joins the server. Change either the Embed or Text to fix this error.',
            interaction,
         );
      }
   },
};
