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
import { punishments, PunishmentType } from '@prisma/client';
import { PermissionFlagsBits } from 'discord.js';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';

export const punishMute = <AuxdibotSubcommand>{
   name: 'mute',
   info: {
      module: Modules['Moderation'],
      description:
         'Mutes a user, making them unable to talk in the server and adding a mute to their record on the server. Default duration is permanent.',
      usageExample: '/punish mute (user) [reason] [duration]',
      permissionsRequired: [PermissionFlagsBits.ModerateMembers],
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      await interaction.deferReply({ ephemeral: true });
      const user = interaction.options.getUser('user', true),
         reason = interaction.options.getString('reason') || 'No reason specified.',
         durationOption = interaction.options.getString('duration') || 'permanent';
      const server = interaction.data.guildData;
      const muted = await getServerPunishments(auxdibot, interaction.guildId, {
         userID: user.id,
         type: PunishmentType.MUTE,
         expired: false,
      });
      if (muted.length > 0)
         return await handleError(auxdibot, 'USER_ALREADY_MUTED', 'This user is already muted!', interaction);

      const member = interaction.data.guild.members.resolve(user.id);

      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);

      if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
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
      if (Number(duration) < 60000) {
         return handleError(
            auxdibot,
            'TOO_SHORT_DURATION',
            'You need to specify a duration longer than one minute!',
            interaction,
         );
      }
      if (!server.mute_role) {
         if (duration == 'permanent') {
            return await handleError(
               auxdibot,
               'NO_TIMEOUT_PERMANENT',
               'Cannot timeout a member permanently!',
               interaction,
            );
         }
      }
      const expires = duration == 'permanent' || !duration ? 'permanent' : duration + Date.now();
      const muteData = <punishments>{
         type: PunishmentType.MUTE,
         reason,
         date: new Date(),
         dmed: false,
         expired: false,
         expires_date: expires && typeof expires != 'string' ? new Date(expires) : undefined,
         userID: user.id,
         serverID: interaction.guildId,
         moderatorID: interaction.user.id,
         punishmentID: await incrementPunishmentsTotal(auxdibot, server.serverID),
      };
      await createPunishment(auxdibot, interaction.data.guild, muteData, interaction, user, duration).catch(
         async (x) => {
            await handleError(
               auxdibot,
               'PUNISHMENT_CREATION_ERROR',
               x.message ?? 'An unknown error occurred while creating the punishment!',
               interaction,
            );
         },
      );
   },
};
