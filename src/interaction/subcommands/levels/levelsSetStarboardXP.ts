import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setStarboardXP from '@/modules/features/levels/setStarboardXP';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsSetStarboardXP = <AuxdibotSubcommand>{
   name: 'starboard_xp',
   group: 'settings',
   info: {
      module: Modules['Levels'],
      description: 'Set the amount of XP given for starring a message on your Discord server.',
      usageExample: '/levels settings starboard_xp (xp)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const xp = Math.round(interaction.options.getNumber('xp', true));

      if (xp < 0) {
         handleError(auxdibot, 'XP_LESS_THAN_ZERO', 'Message XP cannot be less than zero!', interaction);
      }
      setStarboardXP(auxdibot, interaction.guild, xp)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `Members will now get ${xp.toLocaleString()} XP from a starred message.`;
            embed.title = 'Success!';
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'SET_STARBOARD_XP_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the starred message XP for this server!",
               interaction,
            );
         });
   },
};
