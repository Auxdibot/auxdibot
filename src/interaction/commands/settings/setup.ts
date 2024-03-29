import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import Modules from '@/constants/bot/commands/Modules';
import { setupAuto } from '@/interaction/subcommands/settings/setup/setupAuto';
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
      ),
   info: {
      module: Modules['Settings'],
      description: "Setup one or all of Auxdibot's features.",
      usageExample: '/setup (auto)',
   },
   subcommands: [setupAuto],
   async execute() {
      return;
   },
};
