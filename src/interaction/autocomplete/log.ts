import { Auxdibot } from '@/Auxdibot';
import { LogAction } from '@prisma/client';
import { AutocompleteInteraction } from 'discord.js';

export const logAutocomplete = (_: Auxdibot, interaction: AutocompleteInteraction) => {
   if (interaction.options.getFocused().length < 2) return interaction.respond([]);

   interaction.respond(
      Object.keys(LogAction)
         .filter((i) => i.toLowerCase().includes(interaction.options.getFocused().toLowerCase()))
         .map((log) => ({
            name: log
               .split('_')
               .map((i) => i[0].toUpperCase() + i.slice(1).toLowerCase())
               .join(' '),
            value: log,
         })),
   );
};
