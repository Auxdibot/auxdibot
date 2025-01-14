import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleError from '@/util/handleError';

import { EmbedBuilder } from '@discordjs/builders';
import { PunishmentType } from '@prisma/client';
import { PermissionFlagsBits } from 'discord.js';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import expireAllPunishments from '@/modules/features/moderation/expireAllPunishments';

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

      return await expireAllPunishments(auxdibot, interaction.guild, 'BAN', user).then(() => {
         interaction.data.guild.bans.remove(user.id).catch(() => undefined);
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = `📥 Unbanned ${user.username}`;
         embed.description = `User was unbanned.`;
         embed.fields = banned.map((punishment) => punishmentInfoField(punishment, true, true));
         return auxdibot.createReply(interaction, { embeds: [embed] });
      });
   },
};
