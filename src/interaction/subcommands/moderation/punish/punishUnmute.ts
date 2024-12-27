import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import canExecute from '@/util/canExecute';
import handleError from '@/util/handleError';

import { EmbedBuilder } from '@discordjs/builders';
import { LogAction, PunishmentType } from '@prisma/client';
import { PermissionFlagsBits } from 'discord.js';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';

export const punishUnmute = <AuxdibotSubcommand>{
   name: 'unmute',
   info: {
      module: Modules['Moderation'],
      description: 'Unmutes a user if they are currently muted.',
      usageExample: '/punish unmute (user)',
      permissionsRequired: [PermissionFlagsBits.ModerateMembers],
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      await interaction.deferReply({ ephemeral: true });
      const user = interaction.options.getUser('user', true);
      const server = interaction.data.guildData;
      const muted = await getServerPunishments(auxdibot, interaction.guildId, {
         userID: user.id,
         type: PunishmentType.MUTE,
         expired: false,
      });

      if (muted.length == 0)
         return await handleError(auxdibot, 'USER_NOT_MUTED', "This user isn't muted!", interaction);

      const member = interaction.data.guild.members.resolve(user.id);
      if (member) {
         if (!canExecute(interaction.data.guild, interaction.data.member, member)) {
            const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
            noPermissionEmbed.title = '⛔ No Permission!';
            noPermissionEmbed.description = `This user has a higher role than you or owns this server!`;
            return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
         }
         if (server.mute_role) {
            member.roles.remove(interaction.data.guild.roles.resolve(server.mute_role) || '').catch(() => undefined);
         } else {
            member.timeout(null, 'Unmuted').catch(() => undefined);
         }
      }
      await auxdibot.database.punishments.updateMany({
         where: { userID: user.id, type: PunishmentType.MUTE, expired: false },
         data: { expired: true },
      });
      const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      dmEmbed.title = '🔊 Unmuted';
      dmEmbed.description = `You were unmuted on ${interaction.data.guild.name}.`;
      dmEmbed.fields = muted.map((punishment) => punishmentInfoField(punishment, true, true));
      await user.send({ embeds: [dmEmbed] });
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = `🔊 Unmuted ${user.username}`;
      embed.description = `User was unmuted.`;
      embed.fields = muted.map((punishment) => punishmentInfoField(punishment, true, true));
      await auxdibot.log(
         interaction.data.guild,
         {
            userID: user.id,
            description: `${user.username} was unmuted.`,
            date: new Date(),
            type: LogAction.UNMUTE,
         },
         { fields: muted.map((punishment) => punishmentInfoField(punishment, true, true)), user_avatar: true },
      );
      await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
