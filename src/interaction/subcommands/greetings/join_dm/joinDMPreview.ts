import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const joinDMPreview = <AuxdibotSubcommand>{
   name: 'preview',
   group: 'join_dm',
   info: {
      module: Modules['Greetings'],
      description: 'Preview the join DM message.',
      usageExample: '/greetings join_dm preview',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const settings = interaction.data.guildData;
      try {
         const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Embed Preview').setCustomId('dummy'),
         );
         return await auxdibot.createReply(interaction, {
            content: `${settings.join_dm_text || ''}`,
            ...(Object.entries(settings.join_dm_embed || {}).length != 0
               ? {
                    embeds: [
                       JSON.parse(
                          await parsePlaceholders(auxdibot, JSON.stringify(settings.join_dm_embed), {
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
            'INVALID_JOIN_DM_EMBED',
            'This is an invalid embed! This will not be able to send when a user joins the server. Change either the Embed or Text to fix this error.',
            interaction,
         );
      }
   },
};
