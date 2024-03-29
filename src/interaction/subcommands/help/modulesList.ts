import Modules from '@/constants/bot/commands/Modules';
import { promoRow } from '@/constants/bot/promoRow';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { DMAuxdibotCommandData, GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import AuxdibotFeatureModule from '@/interfaces/commands/AuxdibotFeatureModule';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const modulesList = <AuxdibotSubcommand>{
   name: 'modules',
   info: {
      module: Modules['General'],
      description: "View Auxdibot's modules.",
      usageExample: '/help modules',
      allowedDefault: true,
      dmableCommand: true,
   },
   async execute(
      auxdibot: Auxdibot,
      interaction: AuxdibotCommandInteraction<DMAuxdibotCommandData | GuildAuxdibotCommandData>,
   ) {
      const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      embed.title = '❔ Auxdibot Modules';
      const settings = 'guildData' in interaction.data ? interaction.data.guildData : undefined;
      embed.description = Object.keys(Modules).reduce((acc, i) => {
         const module: AuxdibotFeatureModule | undefined = Modules[i];
         return (
            acc +
            `${
               settings
                  ? module.disableable
                     ? settings.disabled_modules.indexOf(i) != -1
                        ? '❌ '
                        : '✅ '
                     : '⬛ '
                  : ''
            }**${module.name}**\n> *${module.description}*\n`
         );
      }, '');
      embed.fields = [
         {
            name: "Don't like a module?",
            value: "Look at the `/disable` and `/enable` commands to disable or enable a specific module's functionality.",
         },
      ];
      return await auxdibot.createReply(interaction, {
         embeds: [embed],
         components: [promoRow.toJSON()],
      });
   },
};
