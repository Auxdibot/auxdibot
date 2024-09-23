import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import toggleLogFilter from '@/modules/features/settings/toggleLogFilter';
import handleError from '@/util/handleError';
import { LogAction } from '@prisma/client';
import { EmbedBuilder } from 'discord.js';

export const logsFilter = <AuxdibotSubcommand>{
   name: 'filter',
   info: {
      module: Modules['Settings'],
      description: 'Toggle a log action from being logged on your server.',
      usageExample: '/logs filter (log action, use /logs actions to see all)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const key = interaction.options.getString('action', true);
      const act = Object.keys(LogAction).find(
         (k) => k == key || k.split('_').join(' ').toLowerCase() == key.toLowerCase(),
      );
      const logAction: LogAction | undefined = LogAction[act] as LogAction;
      if (!logAction)
         return await handleError(auxdibot, 'ACTION_NOT_FOUND', "That log action couldn't be found!", interaction);

      return await toggleLogFilter(auxdibot, interaction.guild, logAction)
         .then(async (filtered) => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully toggled the \`${logAction}\` log. ${
               filtered
                  ? 'It will no longer be logged to your server logs.'
                  : 'It will now be logged to your server logs.'
            }`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch(() => {
            return handleError(
               auxdibot,
               'MODULE_DISABLE_ERROR_OCCURRED',
               'An error occurred attempting to disable this module!',
               interaction,
            );
         });
   },
};
