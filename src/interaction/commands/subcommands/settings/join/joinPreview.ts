import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';

export const joinPreview = <AuxdibotSubcommand>{
   name: 'preview',
   info: {
      module: Modules['Settings'],
      description: 'Preview the join message.',
      usageExample: '/join preview',
      permission: 'settings.join.preview',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      try {
         return await interaction.reply({
            content: `**EMBED PREVIEW**\r\n${server.join_text || ''}`,
            ...(Object.entries(server.join_embed || {}).length != 0
               ? {
                    embeds: [
                       JSON.parse(
                          await parsePlaceholders(
                             auxdibot,
                             JSON.stringify(server.join_embed),
                             interaction.data.guild,
                             interaction.data.member,
                          ),
                       ),
                    ],
                 }
               : {}),
         });
      } catch (x) {
         return await handleError(
            auxdibot,
            'INVALID_JOIN_EMBED',
            'This is an invalid embed! This will not be able to send when a user joins the server. Change either the Embed or Text to fix this error.',
            interaction,
         );
      }
   },
};
