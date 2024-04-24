import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import toggleModule from '@/modules/features/settings/toggleModule';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';

export const moduleDisable = <AuxdibotSubcommand>{
   name: 'disable',
   info: {
      module: Modules['Settings'],
      description: "Disable Auxdibot's modules.",
      usageExample: '/modules disable (module)',
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
      toggleModule(auxdibot, interaction.guild, module.name, false)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully disabled the ${module.name} module. Its functionality & commands will no longer work until re-enabled.`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
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
