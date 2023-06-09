import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import timestampToDuration from '@/util/timestampToDuration';
import canExecute from '@/util/canExecute';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { LogAction, Punishment, PunishmentType } from '@prisma/client';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import createPunishment from '@/modules/features/moderation/createPunishment';
import handleLog from '@/util/handleLog';
import handleError from '@/util/handleError';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('mute')
      .setDescription('Mute a user using Auxdibot.')
      .addUserOption((builder) => builder.setName('user').setDescription('User that will be muted.').setRequired(true))
      .addStringOption((builder) => builder.setName('reason').setDescription('Reason for muted').setRequired(false))
      .addStringOption((builder) =>
         builder.setName('duration').setDescription('Duration as a timestamp').setRequired(false),
      ),
   info: {
      module: Modules['Moderation'],
      description:
         'Mutes a user, making them unable to talk in the server and adding a mute to their record on the server. Default duration is permanent.',
      usageExample: '/mute (user) [reason] [duration]',
      permission: 'moderation.mute',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true),
         reason = interaction.options.getString('reason') || 'No reason specified.',
         durationOption = interaction.options.getString('duration') || 'permanent';
      const server = interaction.data.guildData;
      if (!server.mute_role || !interaction.data.guild.roles.resolve(server.mute_role)) {
         return await handleError(
            auxdibot,
            'NO_MUTE_ROLE',
            'There is no mute role assigned for the server! Do `/settings mute_role` to view the command to add a muterole.',
            interaction,
         );
      }
      if (server.punishments.find((p) => p.userID == user.id && p.type == PunishmentType.BAN))
         return await handleError(auxdibot, 'USER_ALREADY_MUTED', 'This user is already muted!', interaction);

      const member = interaction.data.guild.members.resolve(user.id);

      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);

      if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      const duration = timestampToDuration(durationOption);

      if (!duration) {
         return await handleError(
            auxdibot,
            'INVALID_TIMESTAMP',
            'The timestamp provided is invalid! (Examples of valid timestamps: "1m" for 1 minute, "5d" for 5 days.)',
            interaction,
         );
      }
      member.roles
         .add(interaction.data.guild.roles.resolve(server.mute_role) || '')
         .then(async () => {
            if (!interaction.data) return;
            const expires = duration == 'permanent' || !duration ? 'permanent' : duration + Date.now();
            const muteData = <Punishment>{
               type: PunishmentType.MUTE,
               reason,
               date_unix: Date.now(),
               dmed: false,
               expired: false,
               expires_date_unix: expires && typeof expires != 'string' ? expires : undefined,
               userID: user.id,
               moderatorID: interaction.user.id,
               punishmentID: await incrementPunishmentsTotal(auxdibot, server.serverID),
            };
            const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.punishment).toJSON();
            dmEmbed.title = '🔇 Mute';
            dmEmbed.description = `You were muted on ${
               interaction.data.guild ? interaction.data.guild.name : 'Server'
            }.`;
            dmEmbed.fields = [punishmentInfoField(muteData)];
            muteData.dmed = await user
               .send({ embeds: [dmEmbed] })
               .then(() => true)
               .catch(() => false);
            createPunishment(auxdibot, server.serverID, muteData, interaction).then(async () => {
               await handleLog(
                  auxdibot,
                  interaction.data.guild,
                  {
                     userID: user.id,
                     description: `${user.tag} was muted.`,
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
   },
};
