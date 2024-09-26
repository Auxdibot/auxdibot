import { AttachmentBuilder, Embed } from 'discord.js';

export function createEmbedsFile(embeds: Embed[]) {
   return new AttachmentBuilder(
      Buffer.from(
         embeds
            .map((embed) => {
               return JSON.stringify(embed.toJSON(), null, 2);
            })
            .join('\n\n'),
         'utf-8',
      ),
      { name: 'embeds.json' },
   );
}
