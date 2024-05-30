import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { suggestionsCreate } from '@/interaction/subcommands/suggestions/suggestionsCreate';

/**
 * @name /suggest
 * @description An alias for /suggestions create
 */
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('suggest')
      .setDescription('Create a suggestion for this server.')
      .addStringOption((argBuilder) =>
         argBuilder
            .setName('suggestion')
            .setDescription('The suggestion you want to make for this server.')
            .setRequired(true),
      ),
   info: { ...suggestionsCreate.info, usageExample: '/suggest (suggestion)' },
   execute: suggestionsCreate.execute,
};
