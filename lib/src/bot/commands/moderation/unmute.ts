import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@util/templates/AuxdibotCommand';
import Embeds from '@util/constants/Embeds';
import canExecute from '@util/functions/canExecute';
import { toEmbedField } from '@schemas/PunishmentSchema';
import AuxdibotCommandInteraction from '@util/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import { LogType } from '@util/types/Log';

const unmuteCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('unmute')
      .setDescription('Unmute a user.')
      .addUserOption((builder) => builder.setName('user').setDescription('The user to be unmuted.').setRequired(true)),
   info: {
      help: {
         commandCategory: 'Moderation',
         name: '/unmute',
         description: 'Unmutes a user if they are currently muted.',
         usageExample: '/unmute (user)',
      },
      permission: 'moderation.mute.remove',
   },
   async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true);
      const data = await interaction.data.guildData.fetchData(),
         settings = await interaction.data.guildData.fetchSettings();
      if (!settings.mute_role || !interaction.data.guild.roles.resolve(settings.mute_role)) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description =
            'There is no mute role assigned for the server! Do `/help muterole` to view the command to add a muterole.';
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      const muted = data.getPunishment(user.id, 'mute');
      if (!muted) {
         const errorEmbed = Embeds.ERROR_EMBED.toJSON();
         errorEmbed.description = "This user isn't muted!";
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      const member = interaction.data.guild.members.resolve(user.id);

      if (member) {
         if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
            const noPermissionEmbed = Embeds.DENIED_EMBED.toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
            return await interaction.reply({ embeds: [noPermissionEmbed] });
         }
         member.roles.remove(interaction.data.guild.roles.resolve(settings.mute_role) || '').catch(() => undefined);
      }
      muted.expired = true;
      await interaction.data.guildData.save();
      const dmEmbed = Embeds.SUCCESS_EMBED.toJSON();
      dmEmbed.title = '🔊 Unmuted';
      dmEmbed.description = `You were unmuted on ${interaction.data.guild.name}.`;
      dmEmbed.fields = [toEmbedField(muted)];
      await user.send({ embeds: [dmEmbed] });
      const embed = Embeds.SUCCESS_EMBED.toJSON();
      embed.title = `🔊 Unmuted ${user.tag}`;
      embed.description = `User was unmuted.`;
      embed.fields = [toEmbedField(muted)];
      await interaction.data.guildData.log(
         {
            user_id: interaction.user.id,
            description: 'A user was unmuted.',
            date_unix: Date.now(),
            type: LogType.UNMUTE,
            punishment: muted,
         },
         true,
      );
      await interaction.reply({ embeds: [embed] });
   },
};
module.exports = unmuteCommand;
