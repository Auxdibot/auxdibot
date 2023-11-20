import { Auxdibot } from '../../../../../interfaces/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';

export const attachmentsSet = <AuxdibotSubcommand>{
   name: 'set',
   group: 'attachments',
   info: {
      module: Modules['Moderation'],
      description: 'Set the attachments spam limit for this server.',
      usageExample: '/moderation attachments set (attachments) (duration)',
      permission: 'moderation.attachments.set',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const attachments = interaction.options.getNumber('attachments', true),
         duration = interaction.options.getNumber('duration', true);
      const server = interaction.data.guildData;
      if (
         server.automod_attachments_limit?.messages == attachments &&
         server.automod_attachments_limit?.duration / 1000 == duration
      ) {
         return await handleError(
            auxdibot,
            'SETTINGS_IDENTICAL',
            'This is the same automod attachments limit as you already have set!',
            interaction,
         );
      }
      if (duration > 120) {
         return await handleError(
            auxdibot,
            'DURATION_TOO_LONG',
            'You must specify a duration less than 2 minutes!',
            interaction,
         );
      }

      return auxdibot.database.servers
         .update({
            where: { serverID: server.serverID },
            data: {
               automod_attachments_limit:
                  attachments == 0 || duration == 0 ? null : { messages: attachments, duration: duration * 1000 },
            },
         })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Automod Attachments Limit Set';
            if (attachments == 0) embed.description = 'Disabled attachments filter.';
            else
               embed.description = `📁 Attachments: \`${attachments} attachments\`\n🕰️ Spam Duration: \`${duration}s\``;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description:
                  attachments == 0 || duration == 0
                     ? 'Disabled attachments filter.'
                     : `The Automod attachments limit has been set to ${attachments} attachments every ${duration} seconds.`,
               type: LogAction.AUTOMOD_SETTINGS_CHANGE,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [embed] });
         })
         .catch(() => {
            handleError(auxdibot, 'ERROR_SET_ATTACHMENTS_LIMIT', "Couldn't set the attachments limit!", interaction);
         });
   },
};
