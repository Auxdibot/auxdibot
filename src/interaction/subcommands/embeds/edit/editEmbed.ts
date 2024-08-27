import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import { getMessage } from '@/util/getMessage';
import { isEmbedEmpty } from '@/util/isEmbedEmpty';
export const editEmbed = <AuxdibotSubcommand>{
   name: 'embed',
   group: 'edit',
   info: {
      module: Modules['Messages'],
      usageExample: '/embed edit edmit (message id) (id)',
      description: 'Add a stored embed to a message using its ID.',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const id = interaction.options.getString('id', true);
      const embed = interaction.data.guildData.stored_embeds.find((i) => i.id === id);
      const message_id = interaction.options.getString('message_id', true);
      const guild = interaction.data.guild;
      await interaction.deferReply();
      const message = await getMessage(guild, message_id);
      if (!message) return await handleError(auxdibot, 'MESSAGE_NOT_FOUND', "Couldn't find that message!", interaction);
      try {
         const apiEmbed =
            embed?.embed && !isEmbedEmpty(embed.embed)
               ? JSON.parse(
                    await parsePlaceholders(auxdibot, JSON.stringify(embed.embed), {
                       guild: interaction.data.guild,
                       member: interaction.data.member,
                    }),
                 )
               : undefined;
         const placeholderContext = {
            guild: interaction.data.guild,
            member: interaction.data.member,
         };

         await message.edit({
            ...(embed?.content
               ? { content: await parsePlaceholders(auxdibot, embed.content, placeholderContext) }
               : {}),
            embeds: apiEmbed ? [apiEmbed] : undefined,
         });
      } catch (x) {
         return await handleError(
            auxdibot,
            'EMBED_EDIT_ERROR',
            typeof x === 'object' && 'message' in x
               ? (x as { message: string }).message
               : 'There was an error editing that embed!',
            interaction,
         );
      }

      const success = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      success.title = 'Success!';
      success.description = `Successfully edit embed for message ${message}`;
      return await auxdibot.createReply(interaction, { embeds: [success] });
   },
};
