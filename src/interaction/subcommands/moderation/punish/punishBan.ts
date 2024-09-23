import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createPunishment from '@/modules/features/moderation/createPunishment';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import canExecute from '@/util/canExecute';
import handleError from '@/util/handleError';
import timestampToDuration from '@/util/timestampToDuration';
import { EmbedBuilder } from '@discordjs/builders';
import { Punishment, PunishmentType } from '@prisma/client';
import { PermissionFlagsBits } from 'discord.js';

export const punishBan = <AuxdibotSubcommand>{
   name: 'ban',
   info: {
      module: Modules['Moderation'],
      description:
         'Bans a user, removing them from the server and adding a ban to their record on the server. Default duration is permanent.',
      usageExample: '/punish ban (user) [reason] [duration] [delete_message_days]',
      permissionsRequired: [PermissionFlagsBits.BanMembers],
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true),
         reason = interaction.options.getString('reason') || 'No reason specified.',
         durationOption = interaction.options.getString('duration') || 'permanent',
         deleteMessageDays = interaction.options.getNumber('delete_message_days') || 0;
      const member = interaction.data.guild.members.resolve(user.id);
      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);

      if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
      }
      if (
         interaction.data.guildData.punishments.find(
            (p) => p.userID == user.id && p.type == PunishmentType.BAN && !p.expired,
         )
      )
         return await handleError(auxdibot, 'USER_ALREADY_BANNED', 'This user is already banned!', interaction);

      const duration = timestampToDuration(durationOption);

      if (!duration) {
         return await handleError(
            auxdibot,
            'INVALID_TIMESTAMP',
            'The timestamp provided is invalid! (Examples of valid timestamps: "1m" for 1 minute, "5d" for 5 days.)',
            interaction,
         );
      }
      if (Number(duration) < 60000) {
         return handleError(
            auxdibot,
            'TOO_SHORT_DURATION',
            'You need to specify a duration longer than one minute!',
            interaction,
         );
      }
      const expires = duration == 'permanent' ? 'permanent' : duration + Date.now();
      const banData = <Punishment>{
         type: PunishmentType.BAN,
         reason,
         date: new Date(),
         dmed: false,
         expired: false,
         expires_date: expires && typeof expires != 'string' ? new Date(expires) : undefined,
         userID: user.id,
         moderatorID: interaction.user.id,
         punishmentID: await incrementPunishmentsTotal(auxdibot, interaction.data.guildData.serverID),
      };
      await createPunishment(
         auxdibot,
         interaction.data.guild,
         banData,
         interaction,
         member.user,
         duration,
         deleteMessageDays,
      ).catch(async (x) => {
         await handleError(
            auxdibot,
            'PUNISHMENT_CREATION_ERROR',
            x.message ?? 'An unknown error occurred while creating the punishment!',
            interaction,
         );
      });
   },
};
