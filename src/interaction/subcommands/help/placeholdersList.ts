import Modules from '@/constants/bot/commands/Modules';

import { PlaceholdersData } from '@/constants/bot/placeholders/PlaceholdersData';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { DMAuxdibotCommandData, GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

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
      const placeholdersEmbed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
      placeholdersEmbed.title = '🔁 Placeholders';
      placeholdersEmbed.description =
         'Placeholders can be used in **ANY** Auxdibot command that sends a message! Try out /embed /join or /leave!';
      const placeholders = Object.keys(PlaceholdersData).reduce((accumulator, key) => {
         const data = PlaceholdersData[key];
         if (!accumulator[data.context]) accumulator[data.context] = [];
         accumulator[data.context].push(`\`{%${key}%}\``);
         return accumulator;
      }, {});
      placeholdersEmbed.fields = Object.keys(placeholders).map((placeholder) => {
         return {
            name:
               placeholder === 'null'
                  ? 'No Context'
                  : placeholder
                       ?.split('_')
                       .map((i) => i[0].toUpperCase() + i.slice(1).toLowerCase())
                       .join(' ') || 'No Context',

            value: placeholders[placeholder].join('\r\n'),
         };
      });
      return await auxdibot.createReply(interaction, {
         embeds: [placeholdersEmbed],
         ephemeral: true,
      });
   },
};
