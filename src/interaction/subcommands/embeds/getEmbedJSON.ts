import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { getMessage } from '@/util/getMessage';
import handleError from '@/util/handleError';
import { createEmbedsFile } from '@/modules/features/embeds/createEmbedsFile';

export const getEmbedJSON = <AuxdibotSubcommand>{
   name: 'json',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed json (message_id)',
      description: 'Get the Discord Embed JSON data of any Embed on your server.',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const message_id = interaction.options.getString('message_id', true);
      const guild = interaction.data.guild;
      await interaction.deferReply();
      const message = await getMessage(guild, message_id);
      if (!message) return await handleError(auxdibot, 'MESSAGE_NOT_FOUND', "Couldn't find that message!", interaction);
      if (message.embeds.length <= 0)
         return await handleError(auxdibot, 'NO_EMBEDS_FOUND', 'No embeds exist on this message!', interaction);

      const attachment = createEmbedsFile(message.embeds);

      return await auxdibot
         .createReply(interaction, { content: 'Embed JSON as a File:', files: [attachment] })
         .catch(() => {
            return handleError(
               auxdibot,
               'EMBED_JSON_ERROR',
               "There was an error fetching that embed's JSON!",
               interaction,
            );
         });
   },
};
