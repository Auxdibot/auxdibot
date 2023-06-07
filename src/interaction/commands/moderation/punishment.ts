import { punishmentView } from './../subcommands/punishment/punishmentView';
import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { punishmentDelete } from '../subcommands/punishment/punishmentDelete';
import { punishmentLatest } from '../subcommands/punishment/punishmentLatest';

const punishmentCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('punishment')
      .setDescription('View a users punishment record.')
      .addSubcommand((subcommand) =>
         subcommand
            .setName('delete')
            .setDescription('Delete a punishment.')
            .addNumberOption((builder) =>
               builder.setName('punishment_id').setDescription('The ID of the punishment to delete.').setRequired(true),
            ),
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('view')
            .setDescription('Get a punishment.')
            .addNumberOption((builder) =>
               builder.setName('punishment_id').setDescription('The ID of the punishment to view.').setRequired(true),
            ),
      )
      .addSubcommand((subcommand) => subcommand.setName('latest').setDescription('View the last 10 punishments.')),
   info: {
      module: Modules['Moderation'],
      description: 'View or delete a punishment.',
      usageExample: '/punishment (view|delete|latest)',
      permission: 'moderation.punishments',
   },
   subcommands: [punishmentView, punishmentDelete, punishmentLatest],
   async execute() {
      return;
   },
};
module.exports = punishmentCommand;
