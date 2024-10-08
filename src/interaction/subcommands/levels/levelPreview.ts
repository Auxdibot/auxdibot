import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const levelPreview = <AuxdibotSubcommand>{
   name: 'preview',
   group: 'message',
   info: {
      module: Modules['Levels'],
      description: 'Preview the levelup message.',
      usageExample: '/level message preview',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      try {
         const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Embed Preview').setCustomId('dummy'),
         );
         return await auxdibot.createReply(interaction, {
            content: `${
               (await parsePlaceholders(auxdibot, server.level_message?.content, {
                  guild: interaction.data.guild,
                  member: interaction.data.member,
                  levelup: { from: 0, to: 1 },
               })) || ''
            }`,
            ...(server.level_message?.embed && Object.entries(server.level_message?.embed).length != 0
               ? {
                    embeds: [
                       JSON.parse(
                          await parsePlaceholders(auxdibot, JSON.stringify(server.level_message?.embed), {
                             guild: interaction.data.guild,
                             member: interaction.data.member,
                             levelup: { from: 0, to: 1 },
                          }),
                       ),
                    ],
                 }
               : {}),
            ephemeral: true,
            components: [row],
         });
      } catch (x) {
         console.error(x);
         return await handleError(
            auxdibot,
            'INVALID_JOIN_EMBED',
            'This is an invalid embed! This will not be able to send when a user joins the server. Change either the Embed or Text to fix this error.',
            interaction,
         );
      }
   },
};
