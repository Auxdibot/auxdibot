import { PlaceholdersData } from '@/constants/bot/placeholders/PlaceholdersData';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { EmbedBuilder } from 'discord.js';

export function createPlaceholderList(auxdibot: Auxdibot) {
   const placeholdersEmbed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
   placeholdersEmbed.title = '🔁 Placeholders';
   placeholdersEmbed.description =
      'Placeholders will take context-based information about your Embeds and automatically fill in phrases with the correct data.';
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
   return placeholdersEmbed;
}
