import { APIApplicationCommandOptionChoice, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import Modules from '@/constants/bot/commands/Modules';
import { moduleDisable } from '../../subcommands/settings/modules/modulesDisable';
import { moduleEnable } from '../../subcommands/settings/modules/modulesEnable';
dotenv.config();
export default <AuxdibotCommand>{
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
      permissionsRequired: [PermissionFlagsBits.ManageGuild],
   },
   subcommands: [moduleDisable, moduleEnable],
   async execute() {
      return;
   },
};
