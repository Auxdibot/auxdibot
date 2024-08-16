import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import Modules from '@/constants/bot/commands/Modules';
import { setupStarboard } from '@/interaction/subcommands/settings/setup/setupStarboard';
import { setupLevels } from '@/interaction/subcommands/settings/setup/setupLevels';
import { setupSuggestions } from '@/interaction/subcommands/settings/setup/setupSuggestions';
import { setupModeration } from '@/interaction/subcommands/settings/setup/setupModeration';
import { setupGreetings } from '@/interaction/subcommands/settings/setup/setupGreetings';
import { setupAuto } from '@/interaction/subcommands/settings/setup/setupAuto';
dotenv.config();
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('setup')
      .setDescription("Setup Auxdibot's features with an easily accessible modal.")
      .addSubcommand((builder) =>
         builder
            .setName('auto')
            .setDescription('[OLD] Auxdibot will be automatically configured with default settings.'),
      )
      .addSubcommand((builder) =>
         builder
            .setName('starboard')
            .setDescription('Auxdibot will be automatically configure a Starboard for your server.'),
      )
      .addSubcommand((builder) =>
         builder.setName('levels').setDescription('Auxdibot will be automatically configure Levels for your server.'),
      )
      .addSubcommand((builder) =>
         builder
            .setName('moderation')
            .setDescription('Auxdibot will be automatically configure Moderation for your server.'),
      )
      .addSubcommand((builder) =>
         builder
            .setName('suggestions')
            .setDescription('Auxdibot will be automatically configure Suggestions for your server.'),
      )
      .addSubcommand((builder) =>
         builder
            .setName('greetings')
            .setDescription('Auxdibot will be automatically configure Greetings for your server.'),
      ),
   info: {
      module: Modules['Settings'],
      description: "Setup one or all of Auxdibot's features.",
      usageExample: '/setup (auto|starboard|levels|suggestions|moderation|greetings)',
      permissionsRequired: [PermissionFlagsBits.Administrator],
   },
   subcommands: [setupAuto, setupStarboard, setupLevels, setupSuggestions, setupModeration, setupGreetings],
   async execute() {
      return;
   },
};
