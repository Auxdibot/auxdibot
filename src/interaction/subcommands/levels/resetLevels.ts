import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import resetXP from '@/modules/features/levels/resetXP';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const resetLevels = <AuxdibotSubcommand>{
   name: 'reset',
   group: 'xp',
   info: {
      module: Modules['Levels'],
      description: "Reset a user's level and XP.",
      usageExample: '/levels xp reset (user)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true);
      const member = interaction.data.guild.members.cache.get(user.id);
      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);
      resetXP(auxdibot, interaction.data.guildData.serverID, user.id);
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.description = `Successfully reset ${member}'s Level and XP.`;
      embed.title = 'Success!';
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
