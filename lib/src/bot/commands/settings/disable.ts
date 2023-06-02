import { EmbedBuilder, APIApplicationCommandOptionChoice, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import dotenv from 'dotenv';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/Modules';
import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';
import { Auxdibot } from '@/interfaces/Auxdibot';
dotenv.config();
const placeholderCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('disable')
      .setDescription("Disable Auxdibot's modules. (/help modules)")
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
   info: {
      module: Modules['Settings'],
      description: "Disable Auxdibot's modules. (/help modules)",
      usageExample: '/disable (module)',
      permission: 'settings.modules.disable',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const key = interaction.options.getString('module', true);
      const module: AuxdibotFeatureModule | undefined = Modules[key];
      let embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      if (!module) {
         embed = auxdibot.embeds.error.toJSON();
         embed.description = 'This module does not exist! Do /help modules for a list of every Auxdibot module.';
         return await interaction.reply({ embeds: [embed] });
      }
      if (!module.disableable) {
         embed = auxdibot.embeds.error.toJSON();
         embed.description = 'This module cannot be disabled!';
         return await interaction.reply({ embeds: [embed] });
      }
      if (server.disabled_modules.find((item) => item == module.name)) {
         embed = auxdibot.embeds.error.toJSON();
         embed.description = 'This module is already disabled!';
         return await interaction.reply({ embeds: [embed] });
      }
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { disabled_modules: { push: module.name } },
      });
      embed.title = 'Success!';
      embed.description = `Successfully disabled the ${module.name} module. Its functionality & commands will no longer work until re-enabled.`;
      return await interaction.reply({ embeds: [embed] });
   },
};
module.exports = placeholderCommand;
