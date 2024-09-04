import Modules from '@/constants/bot/commands/Modules';
import { promoRow } from '@/constants/bot/promoRow';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { DMAuxdibotCommandData, GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const moduleInfo = <AuxdibotSubcommand>{
   name: 'module',
   info: {
      module: Modules['General'],
      description: "View a module's information, including commands and usage.",
      usageExample: '/help module (module)',
      allowedDefault: true,
      global: true,
   },
   async execute(
      auxdibot: Auxdibot,
      interaction: AuxdibotCommandInteraction<DMAuxdibotCommandData | GuildAuxdibotCommandData>,
   ) {
      if (!interaction.data) return;
      const settings = 'guildData' in interaction.data ? interaction.data.guildData : undefined;
      const key = interaction.options.getString('module', true);
      const module: AuxdibotFeatureModule | undefined = Modules[key];
      if (!module) {
         return await handleError(
            auxdibot,
            'MODULE_NOT_FOUND',
            'This module does not exist! Do /help modules for a list of every Auxdibot module.',
            interaction,
         );
      }
      const commands = auxdibot.commands ? auxdibot.commands.filter((i) => i.info.module.name == module.name) : [];
      const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
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
      return await auxdibot.createReply(interaction, {
         embeds: [embed],
         components: [promoRow.toJSON()],
         ephemeral: true,
      });
   },
};
