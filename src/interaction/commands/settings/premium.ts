import Modules from '@/constants/bot/commands/Modules';
import { premiumAdd } from '@/interaction/subcommands/settings/premium/premiumAdd';
import { premiumInfo } from '@/interaction/subcommands/settings/premium/premiumInfo';
import { premiumRemove } from '@/interaction/subcommands/settings/premium/premiumRemove';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('premium')
      .setDescription("Manage the premium subscription's settings for this server.")
      .addSubcommand((subcommand) =>
         subcommand.setName('add').setDescription('Add your premium subscription to this server.'),
      )
      .addSubcommand((subcommand) =>
         subcommand.setName('remove').setDescription('Remove your premium subscription from this server.'),
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('info')
            .setDescription('Get information about the premium subscription attached to this server.'),
      ),
   info: {
      module: Modules['Settings'],
      usageExample: '/premium (add|remove|info)',
      premium: 'user',
      permissionsRequired: [PermissionFlagsBits.Administrator],
      description: "Manage the premium subscription's settings for this server.",
   },
   subcommands: [premiumAdd, premiumRemove, premiumInfo],
   async execute() {
      return;
   },
};
