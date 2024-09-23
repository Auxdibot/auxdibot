import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import canExecute from '@/util/canExecute';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction, PunishmentType } from '@prisma/client';
import { PermissionFlagsBits } from 'discord.js';

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
      const user = interaction.options.getUser('user', true);
      const server = interaction.data.guildData;
      const muted = server.punishments.find((p) => p.userID == user.id && p.type == PunishmentType.MUTE && !p.expired);

      if (!muted) return await handleError(auxdibot, 'USER_NOT_MUTED', "This user isn't muted!", interaction);

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
      muted.expired = true;
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { punishments: server.punishments },
      });
      const dmEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      dmEmbed.title = '🔊 Unmuted';
      dmEmbed.description = `You were unmuted on ${interaction.data.guild.name}.`;
      dmEmbed.fields = [punishmentInfoField(muted, true, true)];
      await user.send({ embeds: [dmEmbed] });
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = `🔊 Unmuted ${user.username}`;
      embed.description = `User was unmuted.`;
      embed.fields = [punishmentInfoField(muted, true, true)];
      await handleLog(
         auxdibot,
         interaction.data.guild,
         {
            userID: user.id,
            description: `${user.username} was unmuted.`,
            date: new Date(),
            type: LogAction.UNMUTE,
         },
         [punishmentInfoField(muted, true, true)],
         true,
      );
      await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
