import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { createEmbedBuilder } from '@/modules/features/embeds/createEmbedBuilder';
import handleError from '@/util/handleError';

export const embedBuilder = <AuxdibotSubcommand>{
   name: 'builder',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed builder [id]',
      description: "Post, edit, or store an embed using Auxdibot's Embed Builder.",
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
      if (id && id.length > 64) {
         return handleError(auxdibot, 'INVALID_ID', 'The embed ID must be 64 characters or less.', interaction);
      }
      if (interaction.data.guildData.stored_embeds?.find((embed) => embed.id === id)) {
         return handleError(auxdibot, 'DUPLICATE_ID', 'An embed with that ID already exists!', interaction);
      }
      await createEmbedBuilder(auxdibot, interaction, id);
   },
};
