import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import canExecute from '@/util/canExecute';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const suggestionsUnban = <AuxdibotSubcommand>{
   name: 'unban',
   info: {
      module: Modules['Suggestions'],
      description: 'Unban a user, allowing them to use suggestions.',
      usageExample: '/suggestions unban (user)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true);
      const member = interaction.data.guild.members.cache.get(user.id);
      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);
      if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
      }
      await auxdibot.database.servermembers.upsert({
         where: { serverID_userID: { serverID: interaction.data.guild.id, userID: user.id } },
         update: { suggestions_banned: false },
         create: { serverID: interaction.data.guild.id, userID: user.id },
      });
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.title = 'Success!';
      successEmbed.description = `<@${user.id}> has been unbanned from suggestions.`;
      return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
   },
};
