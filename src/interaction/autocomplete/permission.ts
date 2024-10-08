import { Auxdibot } from '@/Auxdibot';
import { AutocompleteInteraction, PermissionFlagsBits } from 'discord.js';

export const permissionAutocomplete = (_: Auxdibot, interaction: AutocompleteInteraction) => {
   if (interaction.options.getFocused().length < 2) return interaction.respond([]);

   interaction.respond(
      Object.keys(PermissionFlagsBits)
         .filter((i) => i.toLowerCase().includes(interaction.options.getFocused().toLowerCase()))
         .map((permission) => ({
            name: permission,
            value: permission,
         })),
   );
};
