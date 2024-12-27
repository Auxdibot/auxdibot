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
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';

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
      await interaction.deferReply({ ephemeral: true });
      const user = interaction.options.getUser('user', true);
      const banned = await getServerPunishments(auxdibot, interaction.guildId, {
         userID: user.id,
         type: PunishmentType.BAN,
         expired: false,
      });

      if (banned.length == 0)
         return await handleError(auxdibot, 'USER_NOT_BANNED', "This user isn't banned!", interaction);

      interaction.data.guild.bans.remove(user.id).catch(() => undefined);
      await auxdibot.database.punishments.updateMany({
         where: { userID: user.id, type: PunishmentType.BAN, expired: false },
         data: { expired: true },
      });
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = `📥 Unbanned ${user.username}`;
      embed.description = `User was unbanned.`;
      embed.fields = banned.map((punishment) => punishmentInfoField(punishment, true, true));
      await auxdibot.log(
         interaction.data.guild,
         {
            userID: user.id,
            description: `${user.username} was unbanned.`,
            date: new Date(),
            type: LogAction.UNBAN,
         },
         { fields: banned.map((punishment) => punishmentInfoField(punishment, true, true)), user_avatar: true },
      );
      await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
