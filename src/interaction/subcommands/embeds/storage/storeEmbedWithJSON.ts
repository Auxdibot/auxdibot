import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { storeEmbed } from '@/modules/features/embeds/storeEmbed';
import handleError from '@/util/handleError';
import { isEmbedEmpty } from '@/util/isEmbedEmpty';
import { APIEmbed } from 'discord.js';

export const storeEmbedWithJSON = <AuxdibotSubcommand>{
   name: 'json',
   group: 'storage',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed storage json (id) (json) [webhook_url]',
      description: 'Store an embed using valid Discord Embed JSON data.',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const json = interaction.options.getString('json', true);
      const content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';
      const id = interaction.options.getString('id', true);
      const webhook_url = interaction.options.getString('webhook_url');
      await interaction.deferReply();
      try {
         const apiEmbed = JSON.parse(json) satisfies APIEmbed;

         await auxdibot.createReply(interaction, {
            content: `# Stored Embed\nID: \`${id}\`\n\n${content ?? ''}`,
            embeds: apiEmbed && !isEmbedEmpty(apiEmbed as never) ? [apiEmbed] : undefined,
            ephemeral: true,
         });
         return await storeEmbed(
            auxdibot,
            interaction.guild,
            id,
            !isEmbedEmpty(apiEmbed as never) && apiEmbed,
            content,
            webhook_url,
         );
      } catch (x) {
         return handleError(auxdibot, 'EMBED_STORE_ERROR', 'There was an error storing that embed!', interaction);
      }
   },
};
