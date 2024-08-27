import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { getMessage } from '@/util/getMessage';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';

export const editEmbedJSON = <AuxdibotSubcommand>{
   name: 'json',
   group: 'edit',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed edit json (message_id) (json)',
      description: 'Edit an existing Embed by Auxdibot using valid Discord Embed JSON data.',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const message_id = interaction.options.getString('message_id', true);
      const json = interaction.options.getString('json', true);
      const guild = interaction.data.guild;
      await interaction.deferReply();
      const message = await getMessage(guild, message_id);
      if (!message) return await handleError(auxdibot, 'MESSAGE_NOT_FOUND', "Couldn't find that message!", interaction);
      if (message.embeds.length <= 0)
         return await handleError(auxdibot, 'NO_EMBEDS_FOUND', 'No embeds exist on this message!', interaction);
      try {
         await message.edit({
            embeds: [
               JSON.parse(
                  await parsePlaceholders(auxdibot, json, {
                     guild: interaction.data.guild,
                     member: interaction.data.member,
                  }),
               ),
            ],
         });
      } catch (x) {
         return await handleError(
            auxdibot,
            'FAILED_EMBED_EDIT_JSON',
            'There was an error editing that embed! (Auxdibot cannot edit that message, or the JSON provided is malformed!)',
            interaction,
         );
      }
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = 'Success!';
      embed.description = `Edited embed in ${message.channel}.`;
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
