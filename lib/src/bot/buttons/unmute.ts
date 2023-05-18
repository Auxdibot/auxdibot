import AuxdibotButton from '@util/types/AuxdibotButton';
import { GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@util/functions/canExecute';
import Embeds from '@util/constants/Embeds';
import Server from '@models/server/Server';
import { toEmbedField } from '@schemas/PunishmentSchema';
import { LogType } from '@util/types/enums/Log';
import Modules from '@util/constants/Modules';

module.exports = <AuxdibotButton>{
   module: Modules['moderation'],
   name: 'unmute',
   permission: 'moderation.mute.remove',
   async execute(interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const server = await Server.findOrCreateServer(interaction.guild.id);
      if (!server) return;
      const data = await server.fetchData(),
         settings = await server.fetchSettings();
      if (!settings.mute_role || !interaction.guild.roles.resolve(settings.mute_role)) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description =
            'There is no mute role assigned for the server! Do `/help muterole` to view the command to add a muterole.';
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      const muted = data.getPunishment(user_id, 'mute');
      if (!muted) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description = "This user isn't muted!";
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      const member = interaction.guild.members.resolve(user_id);
      const embed = Embeds.SUCCESS_EMBED.toJSON();

      if (member) {
         if (!(await canExecute(interaction.guild, interaction.member as GuildMember, member))) {
            const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
            return await interaction.reply({ embeds: [noPermissionEmbed] });
         }
         member.roles.remove(interaction.guild.roles.resolve(settings.mute_role) || '').catch(() => undefined);
         const dmEmbed = Embeds.SUCCESS_EMBED.toJSON();
         dmEmbed.title = '🔊 Unmuted';
         dmEmbed.description = `You were unmuted on ${interaction.guild.name}.`;
         dmEmbed.fields = [toEmbedField(muted)];
         await member.user.send({ embeds: [dmEmbed] });
      }
      const user = interaction.client.users.resolve(user_id);
      muted.expired = true;
      await server.save();
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
