import {
   EmbedBuilder,
   APIApplicationCommandOptionChoice,
   ActionRowBuilder,
   ButtonBuilder,
   SlashCommandBuilder,
} from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { Auxdibot } from '@/interfaces/Auxdibot';
import dotenv from 'dotenv';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import {
   BaseAuxdibotCommandData,
   DMAuxdibotCommandData,
   GuildAuxdibotCommandData,
} from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/config/Modules';
import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';
dotenv.config();
const PROMO_ROW = new ActionRowBuilder<ButtonBuilder>().addComponents(
   new ButtonBuilder()
      .setStyle(5)
      .setLabel('Invite')
      .setEmoji('📩')
      .setURL(process.env.DISCORD_INVITE_LINK || 'https://bot.auxdible.me'),
   new ButtonBuilder().setStyle(5).setLabel('Website').setEmoji('🖥️').setURL('https://bot.auxdible.me'),
);
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
                  .setDescription('The subcommand you want to learn more about. (Optional)')
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
            const settings =
               'guildData' in interaction.data ? await interaction.data.guildData.fetchSettings() : undefined;
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
               components: [PROMO_ROW.toJSON()],
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
            const settings =
               'guildData' in interaction.data ? await interaction.data.guildData.fetchSettings() : undefined;
            const key = interaction.options.getString('module', true);
            const module: AuxdibotFeatureModule | undefined = Modules[key];
            let embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
            if (!module) {
               embed = auxdibot.embeds.error.toJSON();
               embed.description = 'This module does not exist! Do /help modules for a list of every Auxdibot module.';
               return await interaction.reply({ embeds: [embed] });
            }
            const commands = auxdibot.commands
               ? auxdibot.commands.filter((i) => i.info.module.name == module.name)
               : [];
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
            return await interaction.reply({ embeds: [embed], components: [PROMO_ROW.toJSON()] });
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
               const errorEmbed = auxdibot.embeds.error.toJSON();
               errorEmbed.description = "Couldn't find that command or subcommand!";
               return await interaction.reply({
                  embeds: [errorEmbed],
               });
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
               components: [PROMO_ROW.toJSON()],
            });
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = helpCommand;
