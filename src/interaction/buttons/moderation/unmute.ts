import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@/util/canExecute';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { LogAction, PunishmentType } from '@prisma/client';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleError from '@/util/handleError';
import { createUserEmbed } from '@/modules/features/moderation/createUserEmbed';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'unmute',
   command: 'punish unmute',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const server = await findOrCreateServer(auxdibot, interaction.guild.id);
      if (!server) return;
      await interaction.deferReply({ ephemeral: true });
      const user = interaction.client.users.resolve(user_id);
      if (!user) return;
      const muted = await getServerPunishments(auxdibot, interaction.guild.id, {
         userID: user.id,
         type: PunishmentType.MUTE,
         expired: false,
      });
      if (!muted) return await handleError(auxdibot, 'USER_NOT_MUTED', "This user isn't muted!", interaction);

      const member = interaction.guild.members.resolve(user_id);
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      await auxdibot.database.punishments
         .updateMany({
            where: { userID: user.id, type: PunishmentType.MUTE, expired: false },
            data: { expired: true },
         })
         .then(async () => {
            if (interaction.message.editable) {
               interaction.message.edit(await createUserEmbed(auxdibot, interaction.guild, user_id));
            }
         });
      if (member) {
         if (!(await canExecute(interaction.guild, interaction.member as GuildMember, member))) {
            const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
            return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
         }
         if (server.mute_role) {
            member.roles.remove(interaction.guild.roles.resolve(server.mute_role) || '').catch(() => undefined);
         } else {
            member.timeout(null, 'Unmuted').catch(() => undefined);
         }
         const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         dmEmbed.title = '🔊 Unmuted';
         dmEmbed.description = `You were unmuted on ${interaction.guild.name}.`;
         dmEmbed.fields = muted.map((i) => punishmentInfoField(i, true, true));
         await member.user.send({ embeds: [dmEmbed] });
      }
      auxdibot.log(
         interaction.guild,
         {
            userID: member.id,
            description: `${user.username} was unmuted.`,
            date: new Date(),
            type: LogAction.UNMUTE,
         },
         { fields: muted.map((i) => punishmentInfoField(i, true, true)), user_avatar: true },
      );
      embed.title = `🔊 Unmuted ${user ? user.username : `<@${user_id}>`}`;
      embed.description = `User was unmuted.`;
      embed.fields = muted.map((i) => punishmentInfoField(i, true, true));
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
