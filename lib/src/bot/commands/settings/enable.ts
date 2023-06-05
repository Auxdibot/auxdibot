import { EmbedBuilder, APIApplicationCommandOptionChoice, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/Modules';
import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';
dotenv.config();
const placeholderCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
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
   info: {
      module: Modules['Settings'],
      description: "Enable Auxdibot's modules. (/help modules)",
      usageExample: '/enable (module)',
      permission: 'settings.modules.enable',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const key = interaction.options.getString('module', true);
      const module: AuxdibotFeatureModule = Modules[key];

      if (!server.disabled_modules.find((item) => item == module.name))
         return await handleError(auxdibot, 'MODULE_ALREADY_ENABLED', 'This module is already enabled!', interaction);

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
};
module.exports = placeholderCommand;
