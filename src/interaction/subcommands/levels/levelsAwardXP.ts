import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import awardXP from '@/modules/features/levels/awardXP';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsAwardXP = <AuxdibotSubcommand>{
   name: 'award_xp',
   info: {
      module: Modules['Levels'],
      description: 'Award a user XP points.',
      usageExample: '/levels award_xp (xp) (user)',
      permission: 'levels.xp.award',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const xp = interaction.options.getNumber('xp', true),
         user = interaction.options.getUser('user', true);
      const member = interaction.data.guild.members.cache.get(user.id);
      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);
      awardXP(auxdibot, interaction.data.guildData.serverID, user.id, Math.round(xp));
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.description = `Successfully awarded ${member} ${xp.toLocaleString()} XP.`;
      embed.title = 'Success!';
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
