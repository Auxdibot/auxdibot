import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { LogAction, PunishmentType } from '@prisma/client';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleLog from '@/util/handleLog';
import handleError from '@/util/handleError';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('unban')
      .setDescription('Unban a user.')
      .addUserOption((builder) =>
         builder
            .setName('user')
            .setDescription('The user to be unbanned. Use their Discord user ID.')
            .setRequired(true),
      ),
   info: {
      module: Modules['Moderation'],
      description: 'Unbans a user if they are currently banned. For banned members, use their user ID.',
      usageExample: '/unban (user)',
      permission: 'moderation.ban.remove',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user', true);
      const server = interaction.data.guildData;
      const banned = server.punishments.find((p) => p.userID == user.id && p.type == PunishmentType.BAN);

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
      embed.fields = [punishmentInfoField(banned)];
      await handleLog(
         auxdibot,
         interaction.data.guild,
         {
            userID: user.id,
            description: `${user.username} was unbanned.`,
            date_unix: Date.now(),
            type: LogAction.UNBAN,
         },
         [punishmentInfoField(banned)],
         true,
      );
      await interaction.reply({ embeds: [embed] });
   },
};
