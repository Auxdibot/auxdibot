import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setMessageXP from '@/modules/features/levels/setMessageXP';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsSetMessageXP = <AuxdibotSubcommand>{
   name: 'message_xp',
   group: 'settings',
   info: {
      module: Modules['Levels'],
      description: 'Set the amount of XP given for sending a message.',
      usageExample: '/levels settings message_xp (xp)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const xp = interaction.options.getString('xp', true);
      const xpRange = xp.split('-').map((x) => parseInt(x));

      setMessageXP(auxdibot, interaction.guild, xpRange)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `Members will now be awarded ${
               xpRange[0].toLocaleString() + (xpRange.length > 1 ? ' to ' + xpRange[1].toLocaleString() : '')
            } XP for sending a message.`;
            embed.title = 'Success!';
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'SET_MESSAGE_XP_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the message XP for this server!",
               interaction,
            );
         });
   },
};
