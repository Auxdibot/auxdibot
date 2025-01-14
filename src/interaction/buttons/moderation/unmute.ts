import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { PunishmentType } from '@prisma/client';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleError from '@/util/handleError';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import expireAllPunishments from '@/modules/features/moderation/expireAllPunishments';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'unmute',
   command: 'punish unmute',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const server = await findOrCreateServer(auxdibot, interaction.guild.id);
      if (!server) return;
      await interaction.deferReply({ ephemeral: true });
      const user = interaction.client.users.resolve(user_id);
      if (!user) return;
      const muted = await getServerPunishments(auxdibot, interaction.guild.id, {
         userID: user.id,
         type: PunishmentType.MUTE,
         expired: false,
      });
      if (!muted) return await handleError(auxdibot, 'USER_NOT_MUTED', "This user isn't muted!", interaction);
      return await expireAllPunishments(auxdibot, interaction.guild, 'MUTE', user).then(() => {
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = `🔊 Unmuted ${user ? user.username : `<@${user_id}>`}`;
         embed.description = `User was unmuted.`;
         embed.fields = muted.map((i) => punishmentInfoField(i, true, true));
         return auxdibot.createReply(interaction, { embeds: [embed] });
      });
   },
};
