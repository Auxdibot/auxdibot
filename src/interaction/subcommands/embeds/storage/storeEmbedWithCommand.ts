import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { toAPIEmbed } from '@/util/toAPIEmbed';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import handleError from '@/util/handleError';
import { storeEmbed } from '@/modules/features/embeds/storeEmbed';
import { isEmbedEmpty } from '@/util/isEmbedEmpty';

export const storeEmbedWithCommand = <AuxdibotSubcommand>{
   name: 'command',
   group: 'storage',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed storage command (id) [...embed parameters] [webhook_url]',
      description:
         'Store an embed using command parameters. (View `/embed parameters` for a detailed description of embed parameters.)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const id = interaction.options.getString('id', true);
      if (id && id.match(/[^a-zA-Z0-9_]/g) !== null) {
         return handleError(
            auxdibot,
            'INVALID_ID',
            'A embed ID must be an alphanumeric set of characters, with the exception of "_"',
            interaction,
         );
      }
      if (id.length > 64) {
         return handleError(auxdibot, 'INVALID_ID', 'The embed ID must be 64 characters or less.', interaction);
      }
      if (interaction.data.guildData.stored_embeds?.find((embed) => embed.id === id)) {
         return handleError(auxdibot, 'DUPLICATE_ID', 'An embed with that ID already exists!', interaction);
      }
      const content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';
      const webhook_url = interaction.options.getString('webhook_url');
      const parameters = argumentsToEmbedParameters(interaction);
      await interaction.deferReply();
      try {
         const apiEmbed = toAPIEmbed(parameters);

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
