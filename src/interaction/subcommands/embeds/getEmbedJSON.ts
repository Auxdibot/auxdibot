import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { getMessage } from '@/util/getMessage';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const getEmbedJSON = <AuxdibotSubcommand>{
   name: 'json',
   info: {
      module: Modules['Embeds'],
      usageExample: '/embed json (message_id)',
      description: 'Get the Discord Embed JSON data of any Embed on your server.',
      permission: 'embed.json',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const message_id = interaction.options.getString('message_id', true);
      const guild = interaction.data.guild;
      const message = await getMessage(guild, message_id);
      if (!message) return await handleError(auxdibot, 'MESSAGE_NOT_FOUND', "Couldn't find that message!", interaction);
      if (message.embeds.length <= 0)
         return await handleError(auxdibot, 'NO_EMBEDS_FOUND', 'No embeds exist on this message!', interaction);

      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      try {
         embed.fields = message.embeds.map((embed, index: number) => ({
            name: `Embed #${index + 1}`,
            value: `\`\`\`${JSON.stringify(embed.toJSON())}\`\`\``,
            inline: false,
         }));
         embed.title = 'Embed JSON Data';
         return await interaction.reply({ embeds: [embed] });
      } catch (x) {
         return await handleError(
            auxdibot,
            'EMBED_JSON_TOO_LARGE',
            "The embed given exceeds Auxdibot's embed message limit!",
            interaction,
         );
      }
   },
};
