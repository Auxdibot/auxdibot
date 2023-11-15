import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { PunishmentType } from '@prisma/client';
import calcXP from '@/util/calcXP';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('user')
      .setDescription("View and edit a user's data.")
      .addUserOption((builder) => builder.setName('user').setDescription('The user to view.')),
   info: {
      module: Modules['Moderation'],
      description:
         "Displays an easy to use embed where you can view and edit a user's data, including punishments on their record.",
      usageExample: '/user [user]',
      permission: 'moderation.user',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.channel) return;
      const user = interaction.options.getUser('user') || interaction.user;
      const member = interaction.data.guild.members.resolve(user.id);
      const server = interaction.data.guildData;
      const data = await auxdibot.database.servermembers.findFirst({
         where: { userID: user?.id || interaction.data.member.id, serverID: interaction.data.guild.id },
      });
      const record = server.punishments.filter((p) => p.userID == user.id),
         banned = server.punishments.find((p) => p.userID == user.id && p.type == PunishmentType.BAN && !p.expired),
         muted = server.punishments.find((p) => p.userID == user.id && p.type == PunishmentType.MUTE && !p.expired);
      let overrides = server.permission_overrides.filter((i) => i.roleID == user.id);
      const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      if (member) {
         for (const role of member.roles.cache.values()) {
            overrides = overrides.concat(server.permission_overrides.filter((i) => i.roleID == role.id));
         }
      }
      embed.title = `🧍 @${user.username}`;
      embed.thumbnail = {
         url: user.avatarURL({ size: 128 }) || '',
         width: 128,
         height: 128,
      };

      embed.fields = [
         member
            ? {
                 name: 'Member Data',
                 value: `👋 Join Date: <t:${Math.round((member.joinedTimestamp || Date.now()) / 1000)}>\n${
                    data?.warns
                       ? `⚠️ Warns Threshold: ${data.warns}/${
                            server.automod_punish_threshold_warns || 'No Threshold'
                         }\n`
                       : ''
                 }${member.roles.cache.size > 0 ? `📗 Highest Role: <@&${member.roles.highest.id}>\n` : ''}${
                    member.id == interaction.data.guild.ownerId
                       ? '👑 Owner\n'
                       : member.permissions.has(PermissionsBitField.Flags.Administrator)
                       ? '⚒️ Administrator\n'
                       : ''
                 }${
                    data
                       ? `🏆 Level: **${data.level}** \`${data.xpTill.toLocaleString()}/${calcXP(
                            data.level,
                         ).toLocaleString()} XP\`
                         ${data.suggestions_banned ? '\n🚫 Suggestions Banned' : ''}`
                       : ''
                 }`,
              }
            : { name: 'Member Data Not Found', value: 'User is not in this server!' },
         {
            name: 'Latest Punishments',
            value: record
               .reverse()
               .slice(0, 10)
               .reduce((str, punishment) => {
                  const type = PunishmentValues[punishment.type];
                  return (
                     str +
                     `\n**${type.name}** - PID: ${punishment.punishmentID} - <t:${Math.round(
                        punishment.date_unix / 1000,
                     )}>`
                  );
               }, '\u2800'),
         },
         {
            name: 'Permission Overrides',
            value:
               overrides.reduce(
                  (accumulator, permissionOverride) =>
                     accumulator +
                     `\n${permissionOverride.allowed ? '✅' : '❎'} \`${permissionOverride.permission}\` - ${
                        permissionOverride.roleID
                           ? `<@&${permissionOverride.roleID}>`
                           : permissionOverride.userID
                           ? `<@${permissionOverride.userID}>`
                           : ''
                     }`,
                  '\u2800',
               ) + '\n\u2800',
         },
      ];
      const row_info = new ActionRowBuilder<ButtonBuilder>()
         .addComponents(
            new ButtonBuilder().setCustomId(`record-${user.id}`).setEmoji('📜').setStyle(1).setLabel('Record'),
         )
         .toJSON();
      const row_punishments = new ActionRowBuilder<ButtonBuilder>()
         .addComponents(
            new ButtonBuilder()
               .setCustomId(`unban-${user.id}`)
               .setEmoji('📥')
               .setStyle(4)
               .setLabel('Unban')
               .setDisabled(!banned),
            new ButtonBuilder()
               .setCustomId(`unmute-${user.id}`)
               .setEmoji('🔊')
               .setStyle(4)
               .setLabel('Unmute')
               .setDisabled(!muted),
            new ButtonBuilder()
               .setCustomId(`mute-${user.id}`)
               .setEmoji('🔇')
               .setStyle(2)
               .setLabel('Mute')
               .setDisabled(muted != null || member == null),
            new ButtonBuilder()
               .setCustomId(`ban-${user.id}`)
               .setEmoji('🔨')
               .setStyle(2)
               .setLabel('Ban')
               .setDisabled(banned != null || member == null),
            new ButtonBuilder()
               .setCustomId(`kick-${user.id}`)
               .setEmoji('🚷')
               .setStyle(2)
               .setLabel('Kick')
               .setDisabled(member == null),
         )
         .toJSON();

      return await interaction.reply({ embeds: [embed], components: [row_info, row_punishments] });
   },
};
