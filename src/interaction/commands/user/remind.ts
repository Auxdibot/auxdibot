import Modules from '@/constants/bot/commands/Modules';
import { remindList } from '@/interaction/subcommands/remind/remindList';
import remindOnce from '@/interaction/subcommands/remind/remindOnce';
import { remindRemove } from '@/interaction/subcommands/remind/remindRemove';
import remindRepeat from '@/interaction/subcommands/remind/remindRepeat';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { SlashCommandBuilder } from 'discord.js';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('remind')
      .setDescription('Create reminders based off various parameters.')
      .addSubcommand((builder) =>
         builder
            .setName('once')
            .setDescription('Create a reminder that will remind you once.')
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('date')
                  .setDescription('The date to remind you at. (Can be a date or timestamp)')
                  .setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder.setName('reminder').setDescription('The message to remind you with.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('repeat')
            .setDescription('Create a reminder that will remind you repeatedly.')
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('interval')
                  .setDescription('The interval to remind you at. (Timestamp, ex. "5m" for 5 minutes)')
                  .setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder.setName('reminder').setDescription('The message to remind you with.').setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('start_date')
                  .setDescription('The date to start reminding you at. (Can be a date or timestamp)')
                  .setRequired(false),
            )
            .addIntegerOption((argBuilder) =>
               argBuilder
                  .setName('times_to_repeat')
                  .setDescription('The amount of times to remind you.')
                  .setRequired(false),
            ),
      )
      .addSubcommand((builder) => builder.setName('list').setDescription('List the reminders that you have set.'))
      .addSubcommand((builder) =>
         builder
            .setName('remove')
            .setDescription('Remove a reminder that you have set.')
            .addIntegerOption((argBuilder) =>
               argBuilder.setName('index').setDescription('The index of the reminder to remove.').setRequired(true),
            ),
      )

      .setContexts(0, 1, 2)
      .setIntegrationTypes(1),
   info: {
      module: Modules['User'],
      description: 'Create reminders based off various parameters.',
      usageExample: '/remind (once|repeat|list)',
      allowedDefault: true,
      dmableCommand: true,
   },
   subcommands: [remindOnce, remindRepeat, remindList, remindRemove],
   async execute() {
      return;
   },
};
