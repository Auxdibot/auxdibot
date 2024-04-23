import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { getMessage } from '@/util/getMessage';
import handleError from '@/util/handleError';
import { AttachmentBuilder } from 'discord.js';

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
      const message = await getMessage(guild, message_id);
      if (!message) return await handleError(auxdibot, 'MESSAGE_NOT_FOUND', "Couldn't find that message!", interaction);
      if (message.embeds.length <= 0)
         return await handleError(auxdibot, 'NO_EMBEDS_FOUND', 'No embeds exist on this message!', interaction);

      const attachment = new AttachmentBuilder(
         Buffer.from(
            message.embeds
               .map((embed) => {
                  return JSON.stringify(embed.toJSON(), null, 2);
               })
               .join('\n\n'),
            'utf-8',
         ),
         { name: 'embeds.json' },
      );
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
