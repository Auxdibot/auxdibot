import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@/util/canExecute';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { Punishment, PunishmentType } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import createPunishment from '@/modules/features/moderation/createPunishment';
import handleError from '@/util/handleError';
import { createUserEmbed } from '@/modules/features/moderation/createUserEmbed';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'mute',
   command: 'punish mute',
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
      await createPunishment(auxdibot, interaction.guild, muteData, interaction, member.user).then(async () => {
         if (interaction.message.editable) {
               interaction.message.edit(await createUserEmbed(auxdibot, interaction.guild, user_id))    
         }
      }).catch(async () => {
         return await handleError(
            auxdibot,
            'FAILED_MUTE_USER',
            `Could not mute this user! Check and see if Auxdibot has the Manage Roles permission, or if the mute role is above Auxdibot in the role hierarchy.`,
            interaction,
         );
      });
      return;
   },
};
