import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setEventXP from '@/modules/features/levels/setEventXP';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsSetEventXP = <AuxdibotSubcommand>{
   name: 'event_xp',
   group: 'settings',
   info: {
      module: Modules['Levels'],
      description: 'Set the amount of XP given for attending an event on your Discord server.',
      usageExample: '/levels settings event_xp (xp)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const xp = Math.round(interaction.options.getNumber('xp', true));

      if (xp < 0) {
         handleError(auxdibot, 'XP_LESS_THAN_ZERO', 'Message XP cannot be less than zero!', interaction);
      }
      setEventXP(auxdibot, interaction.guild, xp)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `Members will now get ${xp.toLocaleString()} XP from attending an event on your server.`;
            embed.title = 'Success!';
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'SET_EVENT_XP_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the event attendance XP for this server!",
               interaction,
            );
         });
   },
};
