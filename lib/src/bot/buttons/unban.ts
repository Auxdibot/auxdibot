import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { LogAction, PunishmentType } from '@prisma/client';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleLog from '@/util/handleLog';

module.exports = <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'unban',
   permission: 'moderation.ban.remove',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const server = await findOrCreateServer(auxdibot, interaction.guild.id);
      if (!server) return;
      const banned = server.punishments.find((p) => p.userID == user.id && p.type == PunishmentType.BAN);
      if (!banned) {
         const errorEmbed = auxdibot.embeds.error.toJSON();
         errorEmbed.description = "This user isn't banned!";
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      const user = interaction.client.users.resolve(user_id);
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();

      banned.expired = true;
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { punishments: server.punishments },
      });
      embed.title = `📥 Unbanned ${user ? user.tag : `<@${user_id}>`}`;
      embed.description = `User was unbanned.`;
      embed.fields = [punishmentInfoField(banned)];
      await handleLog(
         auxdibot,
         interaction.guild,
         {
            userID: interaction.user.id,
            description: 'A user was unbanned.',
            date_unix: Date.now(),
            type: LogAction.UNBAN,
         },
         [punishmentInfoField(banned)],
         true,
      );
      return await interaction.reply({ embeds: [embed] });
   },
};
