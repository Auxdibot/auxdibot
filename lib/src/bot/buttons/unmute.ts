import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@/util/canExecute';
import Server from '@/mongo/model/server/Server';
import { toEmbedField } from '@/mongo/schema/PunishmentSchema';
import { LogType } from '@/config/Log';
import Modules from '@/config/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';

module.exports = <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'unmute',
   permission: 'moderation.mute.remove',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const server = await Server.findOrCreateServer(interaction.guild.id);
      if (!server) return;
      const data = await server.fetchData(),
         settings = await server.fetchSettings();
      if (!settings.mute_role || !interaction.guild.roles.resolve(settings.mute_role)) {
         const errorEmbed = auxdibot.embeds.error.toJSON();
         errorEmbed.description =
            'There is no mute role assigned for the server! Do `/help muterole` to view the command to add a muterole.';
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      const muted = data.getPunishment(user_id, 'mute');
      if (!muted) {
         const errorEmbed = auxdibot.embeds.error.toJSON();
         errorEmbed.description = "This user isn't muted!";
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      const member = interaction.guild.members.resolve(user_id);
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();

      if (member) {
         if (!(await canExecute(interaction.guild, interaction.member as GuildMember, member))) {
            const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
            return await interaction.reply({ embeds: [noPermissionEmbed] });
         }
         member.roles.remove(interaction.guild.roles.resolve(settings.mute_role) || '').catch(() => undefined);
         const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         dmEmbed.title = '🔊 Unmuted';
         dmEmbed.description = `You were unmuted on ${interaction.guild.name}.`;
         dmEmbed.fields = [toEmbedField(muted)];
         await member.user.send({ embeds: [dmEmbed] });
      }
      const user = interaction.client.users.resolve(user_id);
      muted.expired = true;
      await data.save();
      embed.title = `🔊 Unmuted ${user ? user.tag : `<@${user_id}>`}`;
      embed.description = `User was unmuted.`;
      embed.fields = [toEmbedField(muted)];
      await server.log(
         interaction.guild,
         {
            user_id: interaction.user.id,
            description: 'A user was unmuted.',
            date_unix: Date.now(),
            type: LogType.UNMUTE,
            punishment: muted,
         },
         true,
      );
      return await interaction.reply({ embeds: [embed] });
   },
};
