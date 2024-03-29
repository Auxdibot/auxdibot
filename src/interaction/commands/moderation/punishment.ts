import { punishmentView } from '../../subcommands/moderation/punishment/punishmentView';
import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { punishmentDelete } from '../../subcommands/moderation/punishment/punishmentDelete';
import { punishmentLatest } from '../../subcommands/moderation/punishment/punishmentLatest';
import { punishmentRecord } from '@/interaction/subcommands/moderation/punishment/punishmentRecord';

export default <AuxdibotCommand>{
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
      .addSubcommand((subcommand) =>
         subcommand
            .setName('record')
            .setDescription('View a users punishment record.')
            .addUserOption((builder) =>
               builder.setName('user').setDescription('The user whose punishments are being displayed.'),
            ),
      )
      .addSubcommand((subcommand) => subcommand.setName('latest').setDescription('View the last 10 punishments.')),
   info: {
      module: Modules['Moderation'],
      description: 'View or delete a punishment.',
      usageExample: '/punishment (view|delete|latest)',
   },
   subcommands: [punishmentView, punishmentDelete, punishmentLatest, punishmentRecord],
   async execute() {
      return;
   },
};
