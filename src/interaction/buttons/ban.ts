import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@/util/canExecute';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { Punishment, PunishmentType } from '@prisma/client';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import createPunishment from '@/modules/features/moderation/createPunishment';
import handleError from '@/util/handleError';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'ban',
   permission: 'moderation.punish.ban',
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
      if (server.punishments.find((p) => p.userID == user_id && p.type == PunishmentType.BAN))
         return await handleError(auxdibot, 'USER_ALREADY_BANNED', 'This user is already banned!', interaction);
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
      await createPunishment(auxdibot, interaction.guild, banData, interaction, member.user).catch(async () => {
         return await handleError(
            auxdibot,
            'FAILED_BAN_USER',
            "Couldn't ban that user. Check if they have a higher role than Auxdibot.",
            interaction,
         );
      });
      return;
   },
};
