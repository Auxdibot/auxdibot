import AuxdibotButton from '@util/types/AuxdibotButton';
import { GuildMember, MessageComponentInteraction } from 'discord.js';
import canExecute from '@util/functions/canExecute';
import Embeds from '@util/constants/Embeds';
import { IPunishment, toEmbedField } from '@schemas/PunishmentSchema';
import Server from '@models/server/Server';
import { LogType } from '@util/types/enums/Log';
import Modules from '@util/constants/Modules';

module.exports = <AuxdibotButton>{
   module: Modules['moderation'],
   name: 'mute',
   permission: 'moderation.mute',
   async execute(interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const member = interaction.guild.members.resolve(user_id);
      if (!member) {
         const embed = Embeds.ERROR_EMBED.toJSON();
         embed.description = 'This user is not in the server!';
         return await interaction.reply({ embeds: [embed] });
      }

      if (!(await canExecute(interaction.guild, interaction.member as GuildMember, member))) {
         const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      const server = await Server.findOrCreateServer(interaction.guild.id);
      const data = await server.fetchData(),
         counter = await server.fetchCounter(),
         settings = await server.fetchSettings();
      if (data.getPunishment(user_id, 'mute')) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description = 'This user is already muted!';
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      member.roles
         .add(interaction.guild.roles.resolve(settings.mute_role || '') || '')
         .then(async () => {
            if (!interaction.guild || !member) return;
            const muteData = <IPunishment>{
               type: 'mute',
               reason: 'No reason given.',
               date_unix: Date.now(),
               dmed: false,
               expired: false,
               expires_date_unix: undefined,
               user_id: user_id,
               moderator_id: interaction.user.id,
               punishment_id: counter.incrementPunishmentID(),
            };
            const dmEmbed = Embeds.PUNISHED_EMBED.toJSON();
            dmEmbed.title = '🔇 Mute';
            dmEmbed.description = `You were muted on ${interaction.guild ? interaction.guild.name : 'Server'}.`;
            dmEmbed.fields = [toEmbedField(muteData)];
            muteData.dmed = await member.user
               .send({ embeds: [dmEmbed] })
               .then(() => true)
               .catch(() => false);
            server.punish(muteData).then(async (embed) => {
               if (!embed || !interaction.guild) return;
               await server.log(
                  interaction.guild,
                  {
                     user_id: interaction.user.id,
                     description: 'A user was muted.',
                     date_unix: Date.now(),
                     type: LogType.MUTE,
                     punishment: muteData,
                  },
                  true,
               );
               return await interaction.reply({ embeds: [embed] });
            });
         })
         .catch(async () => {
            const errorEmbed = Embeds.ERROR_EMBED.toJSON();
            errorEmbed.description = `Could not mute this user! Check and see if Auxdibot has the Manage Roles permission, or if the <@&${settings.mute_role}> role is above Auxdibot in the role hierarchy.`;
            return await interaction.reply({ embeds: [errorEmbed] });
         });
      return;
   },
};
