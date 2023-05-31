import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, MessageComponentInteraction } from 'discord.js';
import { toEmbedField } from '@/mongo/schema/PunishmentSchema';
import Server from '@/mongo/model/server/Server';
import { LogType } from '@/config/Log';
import Modules from '@/config/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';

module.exports = <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'unban',
   permission: 'moderation.ban.remove',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const server = await Server.findOrCreateServer(interaction.guild.id);
      if (!server) return;
      const data = await server.fetchData();
      const banned = data.getPunishment(user_id, 'ban');
      if (!banned) {
         const errorEmbed = auxdibot.embeds.error.toJSON();
         errorEmbed.description = "This user isn't banned!";
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      const user = interaction.client.users.resolve(user_id);
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();

      banned.expired = true;
      await data.save();
      embed.title = `📥 Unbanned ${user ? user.tag : `<@${user_id}>`}`;
      embed.description = `User was unbanned.`;
      embed.fields = [toEmbedField(banned)];
      await server.log(
         interaction.guild,
         {
            user_id: interaction.user.id,
            description: 'A user was unbanned.',
            date_unix: Date.now(),
            type: LogType.UNBAN,
            punishment: banned,
         },
         true,
      );
      return await interaction.reply({ embeds: [embed] });
   },
};
