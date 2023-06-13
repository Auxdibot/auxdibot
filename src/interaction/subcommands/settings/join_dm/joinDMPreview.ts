import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';

export const joinDMPreview = <AuxdibotSubcommand>{
   name: 'preview',
   info: {
      module: Modules['Settings'],
      description: 'Preview the join DM message.',
      usageExample: '/join_dm preview',
      permission: 'settings.joindm.preview',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const settings = interaction.data.guildData;
      try {
         return await interaction.reply({
            content: `**EMBED PREVIEW**\r\n${settings.join_dm_text || ''}`,
            ...(Object.entries(settings.join_dm_embed || {}).length != 0
               ? {
                    embeds: [
                       JSON.parse(
                          await parsePlaceholders(
                             auxdibot,
                             JSON.stringify(settings.join_dm_embed),
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
            'INVALID_JOIN_DM_EMBED',
            'This is an invalid embed! This will not be able to send when a user joins the server. Change either the Embed or Text to fix this error.',
            interaction,
         );
      }
   },
};
