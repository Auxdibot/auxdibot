import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@/util/canExecute';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import { LogAction, Punishment, PunishmentType } from '@prisma/client';
import createPunishment from '@/modules/features/moderation/createPunishment';
import handleLog from '@/util/handleLog';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleError from '@/util/handleError';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'kick',
   permission: 'moderation.kick',
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
      interaction.guild.members
         .kick(member.user, 'No reason given.')
         .then(async () => {
            const kickData = <Punishment>{
               type: PunishmentType.KICK,
               reason: 'No reason given.',
               date_unix: Date.now(),
               dmed: false,
               expired: false,
               expires_date_unix: undefined,
               userID: user_id,
               moderatorID: interaction.user.id,
               punishmentID: await incrementPunishmentsTotal(auxdibot, interaction.guild.id),
            };
            createPunishment(auxdibot, interaction.guild.id, kickData, interaction).then(async () => {
               await handleLog(
                  auxdibot,
                  interaction.guild,
                  {
                     userID: member.user.id,
                     description: `${member.user.tag} was kicked.`,
                     date_unix: Date.now(),
                     type: LogAction.KICK,
                  },
                  [punishmentInfoField(kickData)],
                  true,
               );
               return;
            });
         })
         .catch(async () => {
            return await handleError(auxdibot, 'FAILED_KICK_USER', "Couldn't kick that user.", interaction);
         });
      return;
   },
};
