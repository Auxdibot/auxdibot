import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import awardXP from '@/modules/features/levels/awardXP';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsAwardXP = <AuxdibotSubcommand>{
   name: 'award',
   group: 'xp',
   info: {
      module: Modules['Levels'],
      description: 'Award a user XP points.',
      usageExample: '/levels xp award (xp) (user)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const xp = interaction.options.getNumber('xp', true),
         user = interaction.options.getUser('user', true);
      const member = interaction.data.guild.members.cache.get(user.id);
      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);
      if (member.user.bot) {
         return await handleError(auxdibot, 'ERROR_APP', 'This is a Discord application!', interaction);
      }
      awardXP(auxdibot, interaction.data.guildData.serverID, user.id, Math.round(xp));
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.description = `Successfully awarded ${member} ${xp.toLocaleString()} XP.`;
      embed.title = 'Success!';
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
