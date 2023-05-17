import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '../../util/templates/AuxdibotCommand';
import Embeds from '../../util/constants/Embeds';
import timestampToDuration from '../../util/functions/timestampToDuration';
import canExecute from '../../util/functions/canExecute';
import { IPunishment } from '../../mongo/schema/PunishmentSchema';
import AuxdibotCommandInteraction from '../../util/templates/AuxdibotCommandInteraction';
import GuildAuxdibotCommandData from '../../util/types/commandData/GuildAuxdibotCommandData';
import { LogType } from '../../util/types/Log';

const banCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Ban a user using Auxdibot.')
      .addUserOption((builder) => builder.setName('user').setDescription('User that will be banned.').setRequired(true))
      .addStringOption((builder) =>
         builder.setName('reason').setDescription('Reason for ban (Optional)').setRequired(false),
      )
      .addStringOption((builder) =>
         builder.setName('duration').setDescription('Duration as a timestamp (Optional)').setRequired(false),
      )
      .addNumberOption((builder) =>
         builder
            .setName('delete_message_days')
            .setDescription("How many days back the user's messages should be deleted. (Optional)")
            .setRequired(false),
      ),
   info: {
      help: {
         commandCategory: 'Moderation',
         name: '/ban',
         description:
            'Bans a user, removing them from the server and adding a ban to their record on the server. Default duration is permanent.',
         usageExample: '/ban (user) [reason] [duration]',
      },
      permission: 'moderation.ban',
   },
   async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true),
         reason = interaction.options.getString('reason') || 'No reason specified.',
         durationOption = interaction.options.getString('duration') || 'permanent',
         deleteMessageDays = interaction.options.getNumber('delete_message_days') || 0;
      const data = await interaction.data.guildData.fetchData(),
         counter = await interaction.data.guildData.fetchCounter();
      const member = interaction.data.guild.members.resolve(user.id);
      if (!member) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description = 'This user is not on the server!';
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
         const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      if (data.getPunishment(user.id, 'ban')) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description = 'This user is already banned!';
         return await interaction.reply({ embeds: [errorEmbed] });
      }

      const duration = timestampToDuration(durationOption);

      if (!duration) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description = 'The timestamp provided is invalid! (ex. "1m" for 1 minute, "5d" for 5 days.)';
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      const expires = duration == 'permanent' ? 'permanent' : duration + Date.now();
      interaction.data.guild.members
         .ban(user, {
            reason,
            deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60,
         })
         .then(async () => {
            if (!interaction.data) return;
            const banData = <IPunishment>{
               type: 'ban',
               reason,
               date_unix: Date.now(),
               dmed: false,
               expired: false,
               expires_date_unix: expires && typeof expires != 'string' ? expires : undefined,
               user_id: user.id,
               moderator_id: interaction.user.id,
               punishment_id: counter.incrementPunishmentID(),
            };
            interaction.data.guildData.punish(banData).then(async (embed) => {
               if (!embed || !interaction.data) return;
               await interaction.data.guildData.log(
                  {
                     user_id: interaction.user.id,
                     description: 'A user was banned.',
                     date_unix: Date.now(),
                     type: LogType.BAN,
                     punishment: banData,
                  },
                  true,
               );
               return await interaction.reply({ embeds: [embed] });
            });
         })
         .catch(async () => {
            const errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = "Couldn't ban that user. Check and see if they have a higher role than Auxdibot.";
            return await interaction.reply({ embeds: [errorEmbed] });
         });
   },
};
module.exports = banCommand;
