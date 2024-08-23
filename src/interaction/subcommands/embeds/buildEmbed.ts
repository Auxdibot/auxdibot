import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { createEmbedBuilder } from '@/modules/features/embeds/createEmbedBuilder';
import handleError from '@/util/handleError';

export const buildEmbed = <AuxdibotSubcommand>{
   name: 'build',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed build (id)',
      description: "Build an embed using Auxdibot's Embed Builder.",
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const id = interaction.options.getString('id');
      if (id && id.match(/[^a-zA-Z0-9_]/g) !== null) {
         return handleError(
            auxdibot,
            'INVALID_ID',
            'A embed ID must be an alphanumeric set of characters, with the exception of "_"',
            interaction,
         );
      }
      if (interaction.data.guildData.stored_embeds?.find((embed) => embed.id === id)) {
         return handleError(auxdibot, 'DUPLICATE_ID', 'An embed with that ID already exists!', interaction);
      }
      await createEmbedBuilder(auxdibot, interaction, id);
   },
};
