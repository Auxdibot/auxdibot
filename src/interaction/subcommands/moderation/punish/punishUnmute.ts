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
      const muted = await getServerPunishments(auxdibot, interaction.guildId, {
         userID: user.id,
         type: PunishmentType.MUTE,
         expired: false,
      });

      if (muted.length == 0)
         return await handleError(auxdibot, 'USER_NOT_MUTED', "This user isn't muted!", interaction);

      return await expireAllPunishments(auxdibot, interaction.guild, 'MUTE', user).then(() => {
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = `🔊 Unmuted ${user.username}`;
         embed.description = `User was unmuted.`;
         embed.fields = muted.map((punishment) => punishmentInfoField(punishment, true, true));
         return auxdibot.createReply(interaction, { embeds: [embed] });
      });
   },
};
