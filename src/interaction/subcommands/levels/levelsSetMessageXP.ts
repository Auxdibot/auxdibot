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
      const xp = Math.round(interaction.options.getNumber('xp', true));

      if (xp < 0) {
         handleError(auxdibot, 'XP_LESS_THAN_ZERO', 'Message XP cannot be less than zero!', interaction);
      }
      setMessageXP(auxdibot, interaction.guild, xp)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `Members will now get ${xp.toLocaleString()} XP from chatting.`;
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
