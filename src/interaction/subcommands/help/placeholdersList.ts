import Modules from '@/constants/bot/commands/Modules';

import { Auxdibot } from '@/interfaces/Auxdibot';
import { DMAuxdibotCommandData, GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { createPlaceholderList } from '@/modules/features/embeds/createPlaceholderList';

export const placeholdersList = <AuxdibotSubcommand>{
   name: 'placeholders',
   info: {
      module: Modules['General'],
      description: "View Auxdibot's placeholders.",
      usageExample: '/help placeholders',
      allowedDefault: true,
      dmableCommand: true,
   },
   async execute(
      auxdibot: Auxdibot,
      interaction: AuxdibotCommandInteraction<DMAuxdibotCommandData | GuildAuxdibotCommandData>,
   ) {
      return await auxdibot.createReply(interaction, {
         embeds: [createPlaceholderList(auxdibot)],
         ephemeral: true,
      });
   },
};
