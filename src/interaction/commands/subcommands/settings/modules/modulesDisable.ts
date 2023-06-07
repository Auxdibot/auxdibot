import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';

export const moduleDisable = <AuxdibotSubcommand>{
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
