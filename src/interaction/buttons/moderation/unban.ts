import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { LogAction, PunishmentType } from '@prisma/client';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleLog from '@/util/handleLog';
import handleError from '@/util/handleError';
import { createUserEmbed } from '@/modules/features/moderation/createUserEmbed';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'unban',
   command: 'punish unban',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const server = await findOrCreateServer(auxdibot, interaction.guild.id);
      if (!server) return;
      await interaction.deferReply();
      const banned = server.punishments.find((p) => p.userID == user_id && p.type == PunishmentType.BAN && !p.expired);
      if (!banned) return await handleError(auxdibot, 'USER_NOT_BANNED', "This user isn't banned!", interaction);

      const user = interaction.client.users.resolve(user_id);
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();

      banned.expired = true;
      await auxdibot.database.servers
         .update({
            where: { serverID: server.serverID },
            data: { punishments: server.punishments },
         })
         .then(async () => {
            if (interaction.message.editable) {
               interaction.message.edit(await createUserEmbed(auxdibot, interaction.guild, user_id));
            }
         });
      embed.title = `📥 Unbanned ${user ? user.username : `<@${user_id}>`}`;
      embed.description = `User was unbanned.`;
      embed.fields = [punishmentInfoField(banned, true, true)];
      await handleLog(
         auxdibot,
         interaction.guild,
         {
            userID: user.id,
            description: `${user.username} was unbanned.`,
            date: new Date(),
            type: LogAction.UNBAN,
         },
         [punishmentInfoField(banned, true, true)],
         true,
      );
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
