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
      if (!module.disableable) {
         return await handleError(
            auxdibot,
            'MODULE_CANNOT_BE_DISABLED',
            'This module cannot be disabled!',
            interaction,
         );
      }
      if (server.disabled_modules.find((item) => item == module.name)) {
         return await handleError(auxdibot, 'MODULE_ALREADY_DISABLED', 'This module is already disabled!', interaction);
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
};
module.exports = placeholderCommand;
