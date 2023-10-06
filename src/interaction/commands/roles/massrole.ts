import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { massroleGive } from '../../subcommands/roles/massrole/massroleGive';
import { massroleTake } from '../../subcommands/roles/massrole/massroleTake';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('massrole')
      .setDescription('Give everybody a role, or take a role away from anyone that has it.')
      .addSubcommand((builder) =>
         builder
            .setName('give')
            .setDescription('Give everybody a role.')
            .addRoleOption((argBuilder) =>
               argBuilder.setName('role').setDescription('The role to be given.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('take')
            .setDescription('Take away a role from everybody.')
            .addRoleOption((argBuilder) =>
               argBuilder.setName('role').setDescription('The role to be taken away.').setRequired(true),
            ),
      ),
   info: {
      module: Modules['Roles'],
      description: 'Give everybody a role, or take a role away from anyone that has it.',
      usageExample: '/massrole (give|take)',
      permission: 'massrole',
   },
   subcommands: [massroleGive, massroleTake],
   async execute() {
      return;
   },
};
