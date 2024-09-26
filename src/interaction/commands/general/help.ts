import { helpAll } from './../../subcommands/help/helpAll';
import { APIApplicationCommandOptionChoice, ApplicationIntegrationType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { placeholdersList } from '../../subcommands/help/placeholdersList';
import { modulesList } from '../../subcommands/help/modulesList';
import { moduleInfo } from '../../subcommands/help/moduleInfo';
import { commandInfo } from '../../subcommands/help/commandInfo';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('help')
      .setDescription('View the help for Auxdibot.')
      .addSubcommand((builder) =>
         builder
            .setName('all')
            .setDescription("View Auxdibot's help menu, containing all the information you need to know."),
      )
      .addSubcommand((builder) => builder.setName('modules').setDescription("View Auxdibot's modules."))
      .addSubcommand((builder) => builder.setName('placeholders').setDescription("View Auxdibot's placeholders."))
      .addSubcommand((builder) =>
         builder
            .setName('module')
            .setDescription("View a module's information, including commands and usage.")
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('module')
                  .setDescription('The module to view.')
                  .setChoices(
                     ...Object.keys(Modules).map(
                        (name) => <APIApplicationCommandOptionChoice<string>>{ name: name, value: name },
                     ),
                  )
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('command')
            .setDescription("View a command or subcommand's usage and description.")
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('command')
                  .setDescription('The command name you want to learn more about.')
                  .setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder.setName('subcommand').setDescription('The subcommand you want to learn more about.'),
            ),
      )
      .setContexts(0, 1, 2)
      .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),
   info: {
      module: Modules['General'],
      description: "View Auxdibot's modules, view information about a module or view information about a command.",
      usageExample: '/help (all|placeholders|modules|module|command)',
      allowedDefault: true,
      dmableCommand: true,
   },
   subcommands: [helpAll, modulesList, placeholdersList, moduleInfo, commandInfo],
   async execute() {
      return;
   },
};
