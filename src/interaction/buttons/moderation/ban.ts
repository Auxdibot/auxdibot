import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@/util/canExecute';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { punishments, PunishmentType } from '@prisma/client';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import createPunishment from '@/modules/features/moderation/createPunishment';
import handleError from '@/util/handleError';
import { createUserEmbed } from '@/modules/features/moderation/createUserEmbed';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'ban',
   command: 'punish ban',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const member = interaction.guild.members.resolve(user_id);
      await interaction.deferReply();
      if (!member)
         return await handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);

      if (!(await canExecute(interaction.guild, interaction.member as GuildMember, member))) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
      }
      const banned = await getServerPunishments(auxdibot, interaction.guild.id, {
         userID: user_id,
         type: PunishmentType.BAN,
         expired: false,
      });
      if (banned.length > 0)
         return await handleError(auxdibot, 'USER_ALREADY_BANNED', 'This user is already banned!', interaction);
      const banData = <punishments>{
         type: PunishmentType.BAN,
         reason: 'No reason given.',
         date: new Date(),
         dmed: false,
         expired: false,
         expires_date: undefined,
         userID: user_id,
         serverID: interaction.guild.id,
         moderatorID: interaction.user.id,
         punishmentID: await incrementPunishmentsTotal(auxdibot, interaction.guild.id),
      };

      await createPunishment(auxdibot, interaction.guild, banData, interaction, member.user)
         .then(async () => {
            if (interaction.message.editable) {
               interaction.message.edit(await createUserEmbed(auxdibot, interaction.guild, user_id));
            }
         })
         .catch(async () => {
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
