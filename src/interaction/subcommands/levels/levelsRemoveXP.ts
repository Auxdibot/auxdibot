import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import takeXP from '@/modules/features/levels/takeXP';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsRemoveXP = <AuxdibotSubcommand>{
   name: 'remove',
   group: 'xp',
   info: {
      module: Modules['Levels'],
      description: 'Remove XP points from a user.',
      usageExample: '/levels remove_exp (xp) (user)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const xp = interaction.options.getNumber('xp', true),
         user = interaction.options.getUser('user', true);
      const member = interaction.data.guild.members.cache.get(user.id);
      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);
      takeXP(auxdibot, interaction.data.guildData.serverID, user.id, Math.round(xp));
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.description = `Successfully took ${xp.toLocaleString()} XP from ${member}.`;
      embed.title = 'Success!';
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
