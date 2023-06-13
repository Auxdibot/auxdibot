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
import createPunishment from '@/modules/features/moderation/createPunishment';
import handleLog from '@/util/handleLog';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleError from '@/util/handleError';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Ban a user using Auxdibot.')
      .addUserOption((builder) => builder.setName('user').setDescription('User that will be banned.').setRequired(true))
      .addStringOption((builder) => builder.setName('reason').setDescription('Reason for ban').setRequired(false))
      .addStringOption((builder) =>
         builder.setName('duration').setDescription('Duration as a timestamp').setRequired(false),
      )
      .addNumberOption((builder) =>
         builder
            .setName('delete_message_days')
            .setDescription("How many days back the user's messages should be deleted.")
            .setRequired(false),
      ),
   info: {
      module: Modules['Moderation'],
      description:
         'Bans a user, removing them from the server and adding a ban to their record on the server. Default duration is permanent.',
      usageExample: '/ban (user) [reason] [duration]',
      permission: 'moderation.ban',
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
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      if (interaction.data.guildData.punishments.find((p) => p.userID == user.id && p.type == PunishmentType.BAN))
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
      const expires = duration == 'permanent' ? 'permanent' : duration + Date.now();
      interaction.data.guild.members
         .ban(user, {
            reason,
            deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60,
         })
         .then(async () => {
            if (!interaction.data) return;
            const banData = <Punishment>{
               type: PunishmentType.BAN,
               reason,
               date_unix: Date.now(),
               dmed: false,
               expired: false,
               expires_date_unix: expires && typeof expires != 'string' ? expires : undefined,
               userID: user.id,
               moderatorID: interaction.user.id,
               punishmentID: await incrementPunishmentsTotal(auxdibot, interaction.data.guildData.serverID),
            };
            createPunishment(auxdibot, interaction.data.guildData.serverID, banData).then(async () => {
               await handleLog(
                  auxdibot,
                  interaction.data.guild,
                  {
                     userID: user.id,
                     description: `${user.tag} was banned.`,
                     date_unix: Date.now(),
                     type: LogAction.BAN,
                  },
                  [punishmentInfoField(banData)],
                  true,
               );
               return;
            });
         })
         .catch(async () => {
            return await handleError(
               auxdibot,
               'FAILED_BAN_USER',
               "Couldn't ban that user. Check if they have a higher role than Auxdibot.",
               interaction,
            );
         });
   },
};
