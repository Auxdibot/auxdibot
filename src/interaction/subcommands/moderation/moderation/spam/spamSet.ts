import { Auxdibot } from '../../../../../interfaces/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';

export const spamSet = <AuxdibotSubcommand>{
   name: 'set',
   group: 'spam',
   info: {
      module: Modules['Moderation'],
      description: 'Set the spam limit for this server.',
      usageExample: '/moderation spam set (messages) (duration)',
      permission: 'moderation.spam.set',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const messages = interaction.options.getNumber('messages', true),
         duration = interaction.options.getNumber('duration', true);
      const server = interaction.data.guildData;
      if (server.automod_spam_limit?.messages == messages && server.automod_spam_limit?.duration / 1000 == duration) {
         return await handleError(
            auxdibot,
            'SETTINGS_IDENTICAL',
            'This is the same automod spam limit as you already have set!',
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
               automod_spam_limit: messages == 0 || duration == 0 ? null : { messages, duration: duration * 1000 },
            },
         })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '⚙️ Automod Spam Limit Set';
            if (messages == 0) embed.description = 'Disabled spam filter.';
            else embed.description = `💬 Spam Messages: \`${messages} messages\`\n🕰️ Spam Duration: \`${duration}s\``;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description:
                  messages == 0 || duration == 0
                     ? 'Disabled spam filter.'
                     : `The Automod spam limit has been set to ${messages} messages every ${duration} seconds.`,
               type: LogAction.AUTOMOD_SETTINGS_CHANGE,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [embed] });
         })
         .catch(() => {
            handleError(auxdibot, 'ERROR_SET_SPAM_LIMIT', "Couldn't set the spam limit!", interaction);
         });
   },
};