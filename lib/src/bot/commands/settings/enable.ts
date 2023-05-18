import { APIApplicationCommandOptionChoice, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@util/types/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import dotenv from 'dotenv';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import Modules from '@util/constants/Modules';
import AuxdibotFeatureModule from '@util/types/AuxdibotFeatureModule';
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
   async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const settings = await interaction.data.guildData.fetchSettings();
      const key = interaction.options.getString('module', true);
      const module: AuxdibotFeatureModule | undefined = Modules[key];
      let embed = Embeds.SUCCESS_EMBED.toJSON();
      if (!module) {
         embed = Embeds.ERROR_EMBED.toJSON();
         embed.description = 'This module does not exist! Do /help modules for a list of every Auxdibot module.';
         return await interaction.reply({ embeds: [embed] });
      }
      if (!settings.disabled_modules.find((item) => item == module.name)) {
         embed = Embeds.ERROR_EMBED.toJSON();
         embed.description = 'This module is already enabled!';
         return await interaction.reply({ embeds: [embed] });
      }
      settings.disabled_modules.splice(settings.disabled_modules.indexOf(module.name), 1);
      await settings.save();
      embed.title = 'Success!';
      embed.description = `Successfully enabled the ${module.name} module. Its functionality & commands will now work on this server.`;
      return await interaction.reply({ embeds: [embed] });
   },
};
module.exports = placeholderCommand;
