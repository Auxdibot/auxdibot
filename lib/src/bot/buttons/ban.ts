import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@/util/canExecute';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { LogAction, Punishment, PunishmentType } from '@prisma/client';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import createPunishment from '@/modules/features/moderation/createPunishment';
import handleLog from '@/util/handleLog';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';

module.exports = <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'ban',
   permission: 'moderation.ban',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const member = interaction.guild.members.resolve(user_id);
      if (!member) {
         const embed = auxdibot.embeds.error.toJSON();
         embed.description = 'This user is not in the server!';
         return await interaction.reply({ embeds: [embed] });
      }

      if (!(await canExecute(interaction.guild, interaction.member as GuildMember, member))) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      const server = await findOrCreateServer(auxdibot, interaction.guild.id);
      if (server.punishments.find((p) => p.userID == user_id && p.type == PunishmentType.BAN)) {
         const errorEmbed = auxdibot.embeds.error.toJSON();
         errorEmbed.description = 'This user is already banned!';
         return await interaction.reply({ embeds: [errorEmbed] });
      }

      interaction.guild.members
         .ban(member, {
            reason: 'No reason given.',
         })
         .then(async () => {
            if (!interaction.guild) return;
            const banData = <Punishment>{
               type: PunishmentType.BAN,
               reason: 'No reason given.',
               date_unix: Date.now(),
               dmed: false,
               expired: false,
               expires_date_unix: undefined,
               userID: user_id,
               moderatorID: interaction.user.id,
               punishmentID: await incrementPunishmentsTotal(auxdibot, interaction.guild.id),
            };
            createPunishment(auxdibot, interaction.guild.id, banData, interaction).then(async () => {
               await handleLog(
                  auxdibot,
                  interaction.guild,
                  {
                     userID: user_id,
                     description: 'A user was banned.',
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
            const errorEmbed = auxdibot.embeds.error.toJSON();
            errorEmbed.description = "Couldn't ban that user. Check and see if they have a higher role than Auxdibot.";
            return await interaction.reply({ embeds: [errorEmbed] });
         });
      return;
   },
};
