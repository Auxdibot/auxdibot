import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import canExecute from '@/util/canExecute';
import { toEmbedField } from '@/mongo/schema/PunishmentSchema';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import { LogType } from '@/config/Log';
import Modules from '@/config/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';

const unmuteCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('unmute')
      .setDescription('Unmute a user.')
      .addUserOption((builder) => builder.setName('user').setDescription('The user to be unmuted.').setRequired(true)),
   info: {
      module: Modules['Moderation'],
      description: 'Unmutes a user if they are currently muted.',
      usageExample: '/unmute (user)',
      permission: 'moderation.mute.remove',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true);
      const data = await interaction.data.guildData.fetchData(),
         settings = await interaction.data.guildData.fetchSettings();
      if (!settings.mute_role || !interaction.data.guild.roles.resolve(settings.mute_role)) {
         const errorEmbed = auxdibot.embeds.error.toJSON();
         errorEmbed.description =
            'There is no mute role assigned for the server! Do `/help muterole` to view the command to add a muterole.';
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      const muted = data.getPunishment(user.id, 'mute');
      if (!muted) {
         const errorEmbed = auxdibot.embeds.error.toJSON();
         errorEmbed.description = "This user isn't muted!";
         return await interaction.reply({ embeds: [errorEmbed] });
      }
      const member = interaction.data.guild.members.resolve(user.id);

      if (member) {
         if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
            const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
            return await interaction.reply({ embeds: [noPermissionEmbed] });
         }
         member.roles.remove(interaction.data.guild.roles.resolve(settings.mute_role) || '').catch(() => undefined);
      }
      muted.expired = true;
      await data.save({ validateModifiedOnly: true });
      const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      dmEmbed.title = '🔊 Unmuted';
      dmEmbed.description = `You were unmuted on ${interaction.data.guild.name}.`;
      dmEmbed.fields = [toEmbedField(muted)];
      await user.send({ embeds: [dmEmbed] });
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = `🔊 Unmuted ${user.tag}`;
      embed.description = `User was unmuted.`;
      embed.fields = [toEmbedField(muted)];
      await interaction.data.guildData.log(
         interaction.data.guild,
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
