import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import toggleModule from '@/modules/features/settings/toggleModule';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';

export const moduleEnable = <AuxdibotSubcommand>{
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
         return await handleError(auxdibot, 'MODULE_ALREADY_ENABLED', 'This module is already enabled!', interaction);

      server.disabled_modules.splice(server.disabled_modules.indexOf(module.name), 1);
      toggleModule(auxdibot, interaction.guild, module.name, false)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully disabled the ${module.name} module. Its functionality & commands will no longer work until re-enabled.`;
            return await interaction.reply({ embeds: [embed] });
         })
         .catch(() => {
            handleError(
               auxdibot,
               'MODULE_DISABLE_ERROR_OCCURRED',
               'An error occurred attempting to disable this module!',
               interaction,
            );
         });
   },
};
