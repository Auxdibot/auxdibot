import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@/util/canExecute';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { LogAction, PunishmentType } from '@prisma/client';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleLog from '@/util/handleLog';
import handleError from '@/util/handleError';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'unmute',
   permission: 'moderation.punish.mute.remove',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const server = await findOrCreateServer(auxdibot, interaction.guild.id);
      if (!server) return;
      if (!server.mute_role || !interaction.guild.roles.resolve(server.mute_role))
         return await handleError(
            auxdibot,
            'NO_MUTE_ROLE',
            'There is no mute role assigned for the server! Do `/settings mute_role` to view the command to add a muterole.',
            interaction,
         );
      const user = interaction.client.users.resolve(user_id);
      if (!user) return;
      const muted = server.punishments.find((p) => p.userID == user.id && p.type == PunishmentType.MUTE && !p.expired);
      if (!muted) return await handleError(auxdibot, 'USER_NOT_MUTED', "This user isn't muted!", interaction);

      const member = interaction.guild.members.resolve(user_id);
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();

      if (member) {
         if (!(await canExecute(interaction.guild, interaction.member as GuildMember, member))) {
            const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
            return await interaction.reply({ embeds: [noPermissionEmbed] });
         }
         member.roles.remove(interaction.guild.roles.resolve(server.mute_role) || '').catch(() => undefined);
         const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         dmEmbed.title = '🔊 Unmuted';
         dmEmbed.description = `You were unmuted on ${interaction.guild.name}.`;
         dmEmbed.fields = [punishmentInfoField(muted, true, true)];
         await member.user.send({ embeds: [dmEmbed] });
      }

      muted.expired = true;
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { punishments: server.punishments },
      });
      embed.title = `🔊 Unmuted ${user ? user.username : `<@${user_id}>`}`;
      embed.description = `User was unmuted.`;
      embed.fields = [punishmentInfoField(muted, true, true)];
      await handleLog(
         auxdibot,
         interaction.guild,
         {
            userID: user.id,
            description: `${user.username} was unmuted.`,
            date_unix: Date.now(),
            type: LogAction.UNMUTE,
         },
         [punishmentInfoField(muted, true, true)],
         true,
      );
      return await interaction.reply({ embeds: [embed] });
   },
};
