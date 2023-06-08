import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import canExecute from '@/util/canExecute';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { LogAction, PunishmentType } from '@prisma/client';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleLog from '@/util/handleLog';
import handleError from '@/util/handleError';

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
      const server = interaction.data.guildData;
      if (!server.mute_role || !interaction.data.guild.roles.resolve(server.mute_role)) {
         return await handleError(
            auxdibot,
            'NO_MUTE_ROLE',
            'There is no mute role assigned for the server! Do `/settings mute_role` to view the command to add a muterole.',
            interaction,
         );
      }
      const muted = server.punishments.find((p) => p.userID == user.id && p.type == PunishmentType.MUTE);

      if (!muted) return await handleError(auxdibot, 'USER_NOT_MUTED', "This user isn't muted!", interaction);

      const member = interaction.data.guild.members.resolve(user.id);
      if (member) {
         if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
            const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
            return await interaction.reply({ embeds: [noPermissionEmbed] });
         }
         member.roles.remove(interaction.data.guild.roles.resolve(server.mute_role) || '').catch(() => undefined);
      }
      muted.expired = true;
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { punishments: server.punishments },
      });
      const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      dmEmbed.title = '🔊 Unmuted';
      dmEmbed.description = `You were unmuted on ${interaction.data.guild.name}.`;
      dmEmbed.fields = [punishmentInfoField(muted)];
      await user.send({ embeds: [dmEmbed] });
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = `🔊 Unmuted ${user.tag}`;
      embed.description = `User was unmuted.`;
      embed.fields = [punishmentInfoField(muted)];
      await handleLog(
         auxdibot,
         interaction.data.guild,
         {
            userID: user.id,
            description: `${user.tag} was unmuted.`,
            date_unix: Date.now(),
            type: LogAction.UNMUTE,
         },
         [punishmentInfoField(muted)],
         true,
      );
      await interaction.reply({ embeds: [embed] });
   },
};
module.exports = unmuteCommand;
