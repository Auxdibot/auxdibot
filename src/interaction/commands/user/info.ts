import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { CustomEmojis } from '@/constants/bot/CustomEmojis';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('info')
      .setDescription("Get a user's avatar and user ID using Auxdibot.")
      .addUserOption((builder) =>
         builder.setName('user').setDescription('The user to view more information about.').setRequired(false),
      )
      .setContexts(0, 1, 2)
      .setIntegrationTypes(1),
   info: {
      module: Modules['User'],
      description: "Get a user's avatar and user ID using Auxdibot.",
      usageExample: '/info [user]',
      allowedDefault: true,
      dmableCommand: true,
   },
   async execute(auxdibot, interaction) {
      const user = interaction.options.getUser('user') ?? interaction.user;

      const auxdibotUser = await auxdibot.database.users
         .findFirstOrThrow({ where: { userID: user.id } })
         .then(() => true)
         .catch(() => false);
      const embed = new EmbedBuilder()
         .setTitle(`${CustomEmojis.USER} ${user.displayName} | User Info`)
         .setThumbnail(user.displayAvatarURL())
         .setColor(auxdibot.colors.info)
         .setAuthor({ name: 'User ID: ' + user.id })
         .setDescription(
            `🕰️ Account Created: <t:${Math.round(user.createdTimestamp / 1000)}>\n📝 Username: ${user.username}\n\n${
               auxdibotUser ? `${CustomEmojis.AUXDIBOT} Auxdibot User` : ''
            }`,
         );
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
         new ButtonBuilder()
            .setURL(user.displayAvatarURL({ extension: 'png' }))
            .setStyle(ButtonStyle.Link)
            .setLabel('PNG Avatar'),
         new ButtonBuilder()
            .setURL(user.displayAvatarURL({ extension: 'jpg' }))
            .setStyle(ButtonStyle.Link)
            .setLabel('JPG Avatar'),
         new ButtonBuilder()
            .setURL(user.displayAvatarURL({ extension: 'webp' }))
            .setStyle(ButtonStyle.Link)
            .setLabel('WEBP Avatar'),
      );
      return auxdibot.createReply(interaction, {
         components: [row.toJSON()],
         ephemeral: true,
         embeds: [embed.toJSON()],
      });
   },
};
