import Modules from '@/constants/bot/commands/Modules';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import handleError from '@/util/handleError';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { ButtonStyle, Guild, SlashCommandBuilder } from 'discord.js';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('appeal')
      .setDescription('Appeal a punishment that was given to you.')
      .addStringOption((option) =>
         option
            .setName('appeal_id')
            .setDescription('The appeal ID for the punishment you want to appeal.')
            .setRequired(true),
      )
      .addStringOption((option) =>
         option.setName('reason').setDescription('The reason for appealing this punishment.').setRequired(true),
      ),

   info: {
      description: 'Appeal a punishment that was given to you using Auxdibot.',
      module: Modules['Moderation'],
      allowedDefault: true,
      dmableCommand: true,
      usageExample: '/appeal (appeal_id) (reason)',
   },
   async execute(auxdibot, interaction) {
      await interaction.deferReply({ ephemeral: true });
      const [serverID, punishment_id] = interaction.options.getString('appeal_id').split('$');
      const reason = interaction.options.getString('reason');
      if (reason.length > 1000) {
         return handleError(
            auxdibot,
            'REASON_TOO_LONG',
            'The appeal reason you provided is too long! Please keep it under 1000 characters.',
            interaction,
         );
      }
      const punishment = await getServerPunishments(auxdibot, serverID, {
         punishmentID: Number(punishment_id),
         userID: interaction.user.id,
         expired: false,
      });
      if (punishment.length == 0) {
         return handleError(auxdibot, 'PUNISHMENT_NOT_FOUND', 'I could not find that punishment!', interaction);
      }
      const [punishmentData] = punishment;
      if (punishmentData.appeal) {
         return handleError(auxdibot, 'ALREADY_APPEALED', 'This punishment has already been appealed!', interaction);
      }

      const server = await findOrCreateServer(auxdibot, serverID),
         guild: Guild | undefined = await auxdibot.guilds.fetch(serverID).catch(() => undefined);

      if (!guild || !server) {
         return handleError(auxdibot, 'GUILD_NOT_FOUND', 'I could not find that server!', interaction);
      }
      const hasPremium = await auxdibot.fetchPremiumSubscriptionUser(serverID).catch(() => false);
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
         const embed = new EmbedBuilder()
            .setTitle(`🕴️ Appeal Request | Punishment #${Number(punishment_id)}`)
            .setAuthor({
               name: interaction.user.username,
               iconURL: interaction.user.avatarURL(),
            })
            .setDescription(`\`\`\`${reason}\`\`\``)
            .addFields(punishmentInfoField(punishmentData))
            .setColor(auxdibot.colors.info);
         const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
               .setCustomId(`appeal-${punishment_id}`)
               .setLabel('Appeal')
               .setStyle(ButtonStyle.Success)
               .setEmoji(auxdibot.emojis.cache.get('✅')),
            new ButtonBuilder()
               .setCustomId(`deny-${punishment_id}`)
               .setLabel('Deny')
               .setStyle(ButtonStyle.Danger)
               .setEmoji(auxdibot.emojis.cache.get('🚫')),
         );
         await channel.send({ embeds: [embed], components: [components] });
         await auxdibot.database.punishments.update({
            where: { serverID_punishmentID: { serverID, punishmentID: Number(punishment_id) } },
            data: {
               appeal: {
                  content: reason,
               },
            },
         });
         auxdibot.log(
            guild,
            {
               date: new Date(),
               type: LogAction.APPEAL_CREATED,
               userID: interaction.user.id,
               description: `Punishment appeal for #${punishment_id} has been created by ${interaction.user.username} (${interaction.user.id})`,
            },
            { fields: [punishmentInfoField(punishmentData, true, true)], user_avatar: true },
         );
         const success = new EmbedBuilder()
            .setTitle('✅ Appeal Request Sent')
            .setDescription(
               'Your appeal request has been sent successfully! You will receive a private message when a decision is made.',
            )
            .setColor(auxdibot.colors.accept);
         return await auxdibot.createReply(interaction, { embeds: [success] });
      } catch (x) {
         return handleError(
            auxdibot,
            'APPEAL_ERROR',
            'An error occurred while trying to send the appeal request. Please try again later or contact an administrator.',
            interaction,
         );
      }
   },
};
