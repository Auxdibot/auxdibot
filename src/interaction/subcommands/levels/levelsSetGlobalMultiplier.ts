import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setGlobalMultiplier from '@/modules/features/levels/setGlobalMultiplier';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';

export const levelsSetGlobalMultiplier = <AuxdibotSubcommand>{
   name: 'set_global',
   group: 'multipliers',
   info: {
      module: Modules['Levels'],
      description: 'Set the global XP multiplier for the server. (If empty, set to 1.)',
      usageExample: '/levels multipliers set_global [multiplier]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const multiplier = interaction.options.getNumber('multiplier') ?? 1;

      if (multiplier < 0 || multiplier > 999) {
         handleError(
            auxdibot,
            'MULTIPLIER_INVALID',
            'Multiplier cannot be less than 0 or greater than 999! Please provide a valid multiplier.',
            interaction,
         );
      }
      setGlobalMultiplier(auxdibot, interaction.guild, multiplier)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `The global XP multiplier has been set to \`x${multiplier}\``;
            embed.title = 'Success!';
            auxdibot.log(interaction.guild, {
               type: LogAction.MULTIPLIER_SET,
               description: `The global XP multiplier has been set to x${multiplier}`,
               date: new Date(),
               userID: interaction.user.id,
            });
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'SET_GLOBAL_XP_MULTIPLIER_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the global XP multiplier for this server!",
               interaction,
            );
         });
   },
};
