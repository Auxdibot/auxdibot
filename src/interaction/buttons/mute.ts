import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@/util/canExecute';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { LogAction, Punishment, PunishmentType } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import createPunishment from '@/modules/features/moderation/createPunishment';
import handleLog from '@/util/handleLog';
import handleError from '@/util/handleError';

module.exports = <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'mute',
   permission: 'moderation.mute',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const member = interaction.guild.members.resolve(user_id);
      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);

      if (!(await canExecute(interaction.guild, interaction.member as GuildMember, member))) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      const server = await findOrCreateServer(auxdibot, interaction.guild.id);
      if (!server.mute_role || !interaction.guild.roles.resolve(server.mute_role)) {
         return await handleError(
            auxdibot,
            'NO_MUTE_ROLE',
            'There is no mute role assigned for the server! Do `/settings mute_role` to view the command to add a muterole.',
            interaction,
         );
      }
      if (server.punishments.find((p) => p.userID == user_id && p.type == PunishmentType.BAN))
         return await handleError(auxdibot, 'USER_ALREADY_MUTED', 'This user is already muted!', interaction);
      member.roles
         .add(interaction.guild.roles.resolve(server.mute_role))
         .then(async () => {
            if (!interaction.guild || !member) return;
            const muteData = <Punishment>{
               type: PunishmentType.MUTE,
               reason: 'No reason given.',
               date_unix: Date.now(),
               dmed: false,
               expired: false,
               expires_date_unix: undefined,
               userID: user_id,
               moderatorID: interaction.user.id,
               punishmentID: await incrementPunishmentsTotal(auxdibot, interaction.guild.id),
            };
            const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.punishment).toJSON();
            dmEmbed.title = '🔇 Mute';
            dmEmbed.description = `You were muted on ${interaction.guild ? interaction.guild.name : 'Server'}.`;
            dmEmbed.fields = [punishmentInfoField(muteData)];
            muteData.dmed = await member.user
               .send({ embeds: [dmEmbed] })
               .then(() => true)
               .catch(() => false);
            createPunishment(auxdibot, interaction.guild.id, muteData, interaction).then(async () => {
               await handleLog(
                  auxdibot,
                  interaction.guild,
                  {
                     userID: member.user.id,
                     description: `${member.user.tag} was muted.`,
                     date_unix: Date.now(),
                     type: LogAction.MUTE,
                  },
                  [punishmentInfoField(muteData)],
                  true,
               );
               return;
            });
         })
         .catch(async () => {
            return await handleError(
               auxdibot,
               'FAILED_MUTE_USER',
               `Could not mute this user! Check and see if Auxdibot has the Manage Roles permission, or if the <@&${server.mute_role}> role is above Auxdibot in the role hierarchy.`,
               interaction,
            );
         });
      return;
   },
};
