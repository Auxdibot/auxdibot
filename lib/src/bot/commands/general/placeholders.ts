import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@util/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import dotenv from 'dotenv';
import Placeholders from '@util/types/Placeholders';
import AuxdibotCommandInteraction from '@util/templates/AuxdibotCommandInteraction';
import { BaseAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
dotenv.config();
const placeholderCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('placeholders')
      .setDescription('View a list of placeholders and what they do.'),
   info: {
      help: {
         commandCategory: 'General',
         name: '/placeholders',
         description: 'View a list of placeholders and what they do.',
         usageExample: '/placeholders',
      },
      permission: 'commands.placeholders',
      dmableCommand: true,
   },
   async execute(interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>) {
      const placeholdersEmbed = Embeds.DEFAULT_EMBED.toJSON();
      placeholdersEmbed.title = '🔁 Placeholders';
      placeholdersEmbed.description =
         'Placeholders can be used in **ANY** Auxdibot command that sends a message! Try out /embed /join or /leave!';
      placeholdersEmbed.fields = [
         {
            name: 'Server',
            value: Object.keys(Placeholders)
               .filter((key) => /^server_/.test(key))
               .reduce((accumulator, key) => `${accumulator}\r\n\`%${key}%\``, ''),
         },
         {
            name: 'Member',
            value: Object.keys(Placeholders)
               .filter((key) => /^member_/.test(key))
               .reduce((accumulator, key) => `${accumulator}\r\n\`%${key}%\``, ''),
         },
         {
            name: 'Message',
            value: Object.keys(Placeholders)
               .filter((key) => /^message_/.test(key))
               .reduce((accumulator, key) => `${accumulator}\r\n\`%${key}%\``, ''),
         },
      ];
      return await interaction.reply({
         embeds: [placeholdersEmbed],
      });
   },
};
module.exports = placeholderCommand;
