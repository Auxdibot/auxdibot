import { Auxdibot } from '@/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleError from '@/util/handleError';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from '@discordjs/builders';
import { LogAction, punishments } from '@prisma/client';
import { BaseInteraction, ButtonStyle, Guild } from 'discord.js';
import { punishmentInfoField } from '../punishmentInfoField';

export async function createAppeal(
   auxdibot: Auxdibot,
   guild: Guild,
   punishment: punishments,
   appeal_reason: string,
   interaction: BaseInteraction,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   const hasPremium = await auxdibot.fetchPremiumSubscriptionUser(guild.id).catch(() => false);
   if (!server.appeal_channel || !hasPremium) {
      return handleError(auxdibot, 'APPEALS_NOT_SET', 'Appeals have not been setup for this server!', interaction);
   }
   const channel = guild.channels.cache.get(server.appeal_channel);
   if (!channel || !channel.isTextBased()) {
      return handleError(
         auxdibot,
         'CHANNEL_NOT_FOUND',
         'I could not find a suitable appeals channel! Contact an administrator of this server; it may be a configuration error.',
         interaction,
      );
   }
   try {
      const newPunish = await auxdibot.database.punishments.update({
         where: { serverID_punishmentID: { serverID: guild.id, punishmentID: Number(punishment.punishmentID) } },
         data: {
            appeal: {
               content: appeal_reason,
            },
         },
      });
      const embed = new EmbedBuilder()
         .setTitle(`🕴️ Appeal Request | Punishment #${Number(punishment.punishmentID)}`)
         .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.avatarURL(),
         })
         .setDescription(`\`\`\`${appeal_reason}\`\`\``)
         .addFields(punishmentInfoField(newPunish))
         .setColor(auxdibot.colors.info);
      const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
         new ButtonBuilder()
            .setCustomId(`appeal-${punishment.punishmentID}`)
            .setLabel('Appeal')
            .setStyle(ButtonStyle.Success)
            .setEmoji({ name: '✅' }),
         new ButtonBuilder()
            .setCustomId(`deny-${punishment.punishmentID}`)
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger)
            .setEmoji({ name: '⛔' }),
      );
      await channel.send({ embeds: [embed], components: [components] });

      auxdibot.log(
         guild,
         {
            date: new Date(),
            type: LogAction.APPEAL_CREATED,
            userID: interaction.user.id,
            description: `Punishment appeal for #${punishment.punishmentID} has been created by ${interaction.user.username} (${interaction.user.id})`,
         },
         { fields: [punishmentInfoField(newPunish, true, true)], user_avatar: true },
      );
      const success = new EmbedBuilder()
         .setTitle('✅ Appeal Request Sent')
         .setDescription(
            'Your appeal request has been sent successfully! You will receive a private message when a decision is made.',
         )
         .setColor(auxdibot.colors.accept);
      return await auxdibot.createReply(interaction, { embeds: [success] });
   } catch (x) {
      console.error(x);
      return handleError(
         auxdibot,
         'APPEAL_ERROR',
         'An error occurred while trying to send the appeal request. Please try again later or contact an administrator.',
         interaction,
      );
   }
}
