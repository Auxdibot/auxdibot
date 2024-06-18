import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import Modules from '@/constants/bot/commands/Modules';
import { setupAuto } from '@/interaction/subcommands/settings/setup/setupAuto';
import { setupStarboard } from '@/interaction/subcommands/settings/setup/setupStarboard';
dotenv.config();
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('setup')
      .setDescription("Setup one or all of Auxdibot's features.")
      .addSubcommand((builder) =>
         builder
            .setName('auto')
            .setDescription(
               'Auxdibot will be automatically configured, creating channels & roles for all enabled features.',
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('starboard')
            .setDescription('Auxdibot will be automatically configure a starboard for your server.'),
      ),
   info: {
      module: Modules['Settings'],
      description: "Setup one or all of Auxdibot's features.",
      usageExample: '/setup (auto|starboard)',
      permissionsRequired: [PermissionFlagsBits.Administrator],
   },
   subcommands: [setupAuto, setupStarboard],
   async execute() {
      return;
   },
};
