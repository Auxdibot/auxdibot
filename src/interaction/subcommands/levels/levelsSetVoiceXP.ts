import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setVoiceXP from '@/modules/features/levels/setVoiceXP';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsSetVoiceXP = <AuxdibotSubcommand>{
   name: 'voice_xp',
   group: 'settings',
   info: {
      module: Modules['Levels'],
      description: 'Set the amount of XP given for joining a voice channel for 1 minute.',
      usageExample: '/levels settings voice_xp (xp)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const xp = interaction.options.getString('xp', true);
      const xpRange = xp.split('-').map((x) => parseInt(x));

      setVoiceXP(auxdibot, interaction.guild, xpRange)
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.description = `Members will now get ${
               xpRange[0].toLocaleString() + (xpRange.length > 1 ? ' to ' + xpRange[1].toLocaleString() : '')
            } XP for being in voice chat for 1 minute.`;
            embed.title = 'Success!';
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'SET_VOICE_XP_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the voice chat XP for this server!",
               interaction,
            );
         });
   },
};
