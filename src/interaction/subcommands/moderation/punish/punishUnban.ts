import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleError from '@/util/handleError';

import { EmbedBuilder } from '@discordjs/builders';
import { LogAction, PunishmentType } from '@prisma/client';
import { PermissionFlagsBits } from 'discord.js';

export const punishUnban = <AuxdibotSubcommand>{
   name: 'unban',
   info: {
      module: Modules['Moderation'],
      description: 'Unbans a user if they are currently banned. For banned members, use their user ID.',
      usageExample: '/punish unban (user)',
      permissionsRequired: [PermissionFlagsBits.BanMembers],
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      await interaction.deferReply();
      const user = interaction.options.getUser('user', true);
      const server = interaction.data.guildData;
      const banned = server.punishments.find((p) => p.userID == user.id && p.type == PunishmentType.BAN && !p.expired);

      if (!banned) return await handleError(auxdibot, 'USER_NOT_BANNED', "This user isn't banned!", interaction);

      interaction.data.guild.bans.remove(user.id).catch(() => undefined);
      banned.expired = true;
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { punishments: server.punishments },
      });
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = `📥 Unbanned ${user.username}`;
      embed.description = `User was unbanned.`;
      embed.fields = [punishmentInfoField(banned, true, true)];
      await auxdibot.log(
         interaction.data.guild,
         {
            userID: user.id,
            description: `${user.username} was unbanned.`,
            date: new Date(),
            type: LogAction.UNBAN,
         },
         { fields: [punishmentInfoField(banned, true, true)], user_avatar: true },
      );
      await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
