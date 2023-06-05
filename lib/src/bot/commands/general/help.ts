import { EmbedBuilder, APIApplicationCommandOptionChoice, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { Auxdibot } from '@/interfaces/Auxdibot';
import dotenv from 'dotenv';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import {
   BaseAuxdibotCommandData,
   DMAuxdibotCommandData,
   GuildAuxdibotCommandData,
} from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';
import handleError from '@/util/handleError';
import { promoRow } from '@/constants/bot/promoRow';
dotenv.config();

const helpCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('help')
      .setDescription('View the help for Auxdibot.')
      .addSubcommand((builder) => builder.setName('modules').setDescription("View Auxdibot's modules."))
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
                  .setName('command_name')
                  .setDescription('The command name you want to learn more about.')
                  .setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('subcommand_name')
                  .setDescription('The subcommand you want to learn more about.')
                  .setRequired(false),
            ),
      ),
   info: {
      module: Modules['General'],
      description: "View Auxdibot's modules, view information about a module or view information about a command.",
      usageExample: '/help (modules|module|command)',
      allowedDefault: true,
      permission: 'commands.help',
      dmableCommand: true,
   },
   subcommands: [
      {
         name: 'modules',
         info: {
            module: Modules['General'],
            description: "View Auxdibot's modules.",
            usageExample: '/help modules',
            allowedDefault: true,
            permission: 'commands.help.modules',
            dmableCommand: true,
         },
         async execute(
            auxdibot: Auxdibot,
            interaction: AuxdibotCommandInteraction<DMAuxdibotCommandData | GuildAuxdibotCommandData>,
         ) {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
            embed.title = '❔ Auxdibot Modules';
            const settings = 'guildData' in interaction.data ? interaction.data.guildData : undefined;
            embed.description = Object.keys(Modules).reduce((acc, i) => {
               const module: AuxdibotFeatureModule | undefined = Modules[i];
               return (
                  acc +
                  `${
                     settings
                        ? module.disableable
                           ? settings.disabled_modules.indexOf(i) != -1
                              ? '❌ '
                              : '✅ '
                           : '⬛ '
                        : ''
                  }**${module.name}**\n> *${module.description}*\n`
               );
            }, '');
            embed.fields = [
               {
                  name: "Don't like a module?",
                  value: "Look at the `/disable` and `/enable` commands to disable or enable a specific module's functionality.",
               },
            ];
            return await interaction.reply({
               embeds: [embed],
               components: [promoRow.toJSON()],
            });
         },
      },
      {
         name: 'module',
         info: {
            module: Modules['General'],
            description: "View a module's information, including commands and usage.",
            usageExample: '/help module (module)',
            allowedDefault: true,
            permission: 'commands.help.module',
            dmableCommand: true,
         },
         async execute(
            auxdibot: Auxdibot,
            interaction: AuxdibotCommandInteraction<DMAuxdibotCommandData | GuildAuxdibotCommandData>,
         ) {
            if (!interaction.data) return;
            const settings = 'guildData' in interaction.data ? interaction.data.guildData : undefined;
            const key = interaction.options.getString('module', true);
            const module: AuxdibotFeatureModule | undefined = Modules[key];
            if (!module) {
               return await handleError(
                  auxdibot,
                  'MODULE_NOT_FOUND',
                  'This module does not exist! Do /help modules for a list of every Auxdibot module.',
                  interaction,
               );
            }
            const commands = auxdibot.commands
               ? auxdibot.commands.filter((i) => i.info.module.name == module.name)
               : [];
            const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
            embed.title = `❔ ${module.name} ${
               settings && settings.disabled_modules.indexOf(key) != -1 ? '*(Disabled)*' : ''
            }`;
            embed.description = `${module.disableable ? 'Can be disabled.' : 'Not able to be disabled.'}\n\n*${
               module.description
            }*`;
            embed.fields = [
               {
                  name: 'Module Commands',
                  value: commands.reduce((acc, i) => acc + ` **/${i.data.name}**\n> ${i.info.description}\n\n`, ''),
               },
            ];
            return await interaction.reply({ embeds: [embed], components: [promoRow.toJSON()] });
         },
      },
      {
         name: 'command',
         info: {
            module: Modules['General'],
            description: "View a command or subcommand's usage and description.",
            usageExample: '/help command (command) [subcommand]',
            allowedDefault: true,
            permission: 'commands.help.command',
            dmableCommand: true,
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<BaseAuxdibotCommandData>) {
            const command_name = interaction.options.getString('command_name', true),
               subcommand_name = interaction.options.getString('subcommand_name');
            const command = auxdibot.commands.get(command_name);
            const subcommand =
               subcommand_name && command && command.subcommands
                  ? command.subcommands.filter((subcommand) => subcommand.name == subcommand_name)[0]
                  : undefined;
            const info = subcommand ? subcommand.info : command ? command.info : undefined;
            if (!info) {
               return await handleError(
                  auxdibot,
                  'COMMAND_NOT_FOUND',
                  "Couldn't find that command or subcommand!",
                  interaction,
               );
            }

            const helpCommandEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
            helpCommandEmbed.title = `❔ /${command.data.name} ${subcommand ? subcommand.name : ''}`;
            helpCommandEmbed.author = {
               name: `Category: ${info.module.name}`,
            };
            helpCommandEmbed.fields = [
               {
                  name: 'Command Info',
                  value: `${info.description}`,
               },
               {
                  name: 'Usage',
                  value: `\`${info.usageExample}\``,
               },
            ];
            helpCommandEmbed.footer = {
               text: `Permission: ${info.permission}`,
            };
            return await interaction.reply({
               embeds: [helpCommandEmbed],
               components: [promoRow.toJSON()],
            });
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = helpCommand;
