import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import Placeholders from '@/config/Placeholders';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { BaseAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/config/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
dotenv.config();
const placeholderCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('placeholders')
      .setDescription('View a list of placeholders and what they do.'),
   info: {
      module: Modules['General'],
      description: 'View a list of placeholders and what they do.',
      usageExample: '/placeholders',
      permission: 'commands.placeholders',
      dmableCommand: true,
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>) {
      const placeholdersEmbed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
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
