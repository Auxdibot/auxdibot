import { EmbedBuilder, APIApplicationCommandOptionChoice, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';
dotenv.config();
const placeholderCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('modules')
      .setDescription("Manage Auxdibot's modules. (/help modules)")
      .addSubcommand((builder) =>
         builder
            .setName('disable')
            .setDescription("Disable Auxdibot's modules.")
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('module')
                  .setDescription('The module to be disabled.')
                  .setChoices(
                     ...Object.keys(Modules)
                        .filter((name) => Modules[name].disableable)
                        .map((name) => <APIApplicationCommandOptionChoice<string>>{ name: name, value: name }),
                  )
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('enable')
            .setDescription("Enable Auxdibot's modules. (/help modules)")
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('module')
                  .setDescription('The module to be enabled.')
                  .setChoices(
                     ...Object.keys(Modules).map(
                        (name) => <APIApplicationCommandOptionChoice<string>>{ name: name, value: name },
                     ),
                  )
                  .setRequired(true),
            ),
      ),
   info: {
      module: Modules['Settings'],
      description: "Manage Auxdibot's modules. (/help modules)",
      usageExample: '/modules (disable|enable) (module)',
      permission: 'settings.modules',
   },
   subcommands: [
      {
         name: 'enable',
         info: {
            module: Modules['Settings'],
            description: "Enable Auxdibot's modules. (/help modules)",
            usageExample: '/modules enable (module)',
            permission: 'settings.modules.enable',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const key = interaction.options.getString('module', true);
            const module: AuxdibotFeatureModule = Modules[key];

            if (!server.disabled_modules.find((item) => item == module.name))
               return await handleError(
                  auxdibot,
                  'MODULE_ALREADY_ENABLED',
                  'This module is already enabled!',
                  interaction,
               );

            server.disabled_modules.splice(server.disabled_modules.indexOf(module.name), 1);
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { disabled_modules: server.disabled_modules },
            });
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully enabled the ${module.name} module. Its functionality & commands will now work on this server.`;
            return await interaction.reply({ embeds: [embed] });
         },
      },
      {
         name: 'disable',
         info: {
            module: Modules['Settings'],
            description: "Disable Auxdibot's modules. (/help modules)",
            usageExample: '/modules disable (module)',
            permission: 'settings.modules.disable',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const server = interaction.data.guildData;
            const key = interaction.options.getString('module', true);
            const module: AuxdibotFeatureModule | undefined = Modules[key];
            if (!module.disableable) {
               return await handleError(
                  auxdibot,
                  'MODULE_CANNOT_BE_DISABLED',
                  'This module cannot be disabled!',
                  interaction,
               );
            }
            if (server.disabled_modules.find((item) => item == module.name)) {
               return await handleError(
                  auxdibot,
                  'MODULE_ALREADY_DISABLED',
                  'This module is already disabled!',
                  interaction,
               );
            }
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { disabled_modules: { push: module.name } },
            });
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully disabled the ${module.name} module. Its functionality & commands will no longer work until re-enabled.`;
            return await interaction.reply({ embeds: [embed] });
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = placeholderCommand;
